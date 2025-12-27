// Advanced VGC Battle AI V2 - Smarter decisions with damage prediction
import { AIDecision, BattleTeam, BattleAction, BattlePokemon, FieldState, SideConditions } from '../types/battle';
import { Move, PokemonType } from '../types/pokemon';
import { calculateDamageV2, calculateEffectiveSpeed, getTypeEffectiveness } from './battleEngineV2';
import { getAbilityEffect } from '../data/abilities';
import { VGC_USAGE_DATA, getUsageData, getCounters } from '../data/vgcStats';

// ============================================
// MAIN AI DECISION FUNCTION
// ============================================

export function getAIActionV2(
  aiTeam: BattleTeam,
  playerTeam: BattleTeam,
  field: FieldState,
  isDoubles: boolean = true
): AIDecision[] {
  const aiActive = aiTeam.selectedForBattle.filter(p => p.isActive && !p.isFainted);
  const playerActive = playerTeam.selectedForBattle.filter(p => p.isActive && !p.isFainted);

  const decisions: AIDecision[] = [];

  // For each active AI Pokemon, decide an action
  aiActive.forEach((aiPokemon, index) => {
    const decision = decideSingleAction(
      aiPokemon,
      aiTeam,
      playerActive,
      playerTeam,
      field,
      isDoubles,
      index
    );
    decisions.push(decision);
  });

  return decisions;
}

function decideSingleAction(
  aiPokemon: BattlePokemon,
  aiTeam: BattleTeam,
  playerActive: BattlePokemon[],
  playerTeam: BattleTeam,
  field: FieldState,
  isDoubles: boolean,
  activeIndex: number
): AIDecision {
  const allDecisions: AIDecision[] = [];

  // 1. Evaluate all move options against all valid targets
  aiPokemon.selectedMoves.forEach((move, moveIndex) => {
    playerActive.forEach((target, targetIndex) => {
      const moveDecision = evaluateMoveDecision(
        aiPokemon,
        target,
        move,
        moveIndex,
        targetIndex,
        field,
        isDoubles,
        playerActive,
        aiTeam.selectedForBattle.filter(p => p.isActive && p !== aiPokemon)
      );
      allDecisions.push(moveDecision);
    });
  });

  // 2. Evaluate switch options
  const switchDecision = evaluateSwitchDecision(
    aiPokemon,
    aiTeam,
    playerActive,
    field
  );
  if (switchDecision) {
    allDecisions.push(switchDecision);
  }

  // 3. Evaluate mechanic usage (Dynamax, Tera)
  const mechanicDecisions = evaluateMechanicDecisions(
    aiPokemon,
    aiTeam,
    playerActive,
    field
  );
  allDecisions.push(...mechanicDecisions);

  // Sort by priority and return best
  allDecisions.sort((a, b) => b.priority - a.priority);

  return allDecisions[0] || createDefaultDecision(aiPokemon, activeIndex);
}

// ============================================
// MOVE EVALUATION
// ============================================

function evaluateMoveDecision(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move,
  moveIndex: number,
  targetIndex: number,
  field: FieldState,
  isDoubles: boolean,
  allTargets: BattlePokemon[],
  allies: BattlePokemon[]
): AIDecision {
  let priority = 50;
  let reasoning = `Use ${move.name} on ${defender.name}`;

  // Skip if can't use move (e.g., Taunt blocking status)
  if (!canUseMove(attacker, move, field)) {
    return { action: createMoveAction(0, moveIndex, targetIndex), reasoning: 'Cannot use move', priority: 0 };
  }

  // Calculate damage prediction
  const damageCalc = calculateDamageV2(attacker, defender, move, field, isDoubles, allTargets);

  // ========== DAMAGE-BASED PRIORITY ==========
  const damagePercent = (damageCalc.damage / defender.currentHp) * 100;
  priority += damagePercent * 0.5;

  // ========== KO PRIORITY ==========
  if (damageCalc.koChance >= 100) {
    priority += 80;
    reasoning = `OHKO ${defender.name} with ${move.name}!`;
  } else if (damageCalc.koChance >= 80) {
    priority += 50;
    reasoning = `High chance to KO ${defender.name} with ${move.name} (${damageCalc.koChance}%)`;
  } else if (damageCalc.koChance >= 50) {
    priority += 30;
    reasoning = `50/50 KO chance on ${defender.name}`;
  }

  // ========== TYPE EFFECTIVENESS ==========
  if (damageCalc.effectiveness >= 4) {
    priority += 40;
    reasoning = `4x super effective ${move.name} against ${defender.name}!`;
  } else if (damageCalc.effectiveness >= 2) {
    priority += 25;
  } else if (damageCalc.effectiveness === 0) {
    priority = 0;
    reasoning = `${move.name} is immune - skip`;
  } else if (damageCalc.effectiveness < 1) {
    priority -= 20;
  }

  // ========== STAB BONUS ==========
  if (damageCalc.stab) {
    priority += 10;
  }

  // ========== MOVE PRIORITY ==========
  if (move.priority > 0) {
    priority += 15;
    // Priority moves are especially good for finishing off
    if (damageCalc.koChance > 50) {
      priority += 20;
    }
  }

  // ========== ACCURACY CONSIDERATION ==========
  const accuracy = move.accuracy || 100;
  if (accuracy < 100) {
    priority *= (accuracy / 100);
    if (accuracy < 80) {
      priority -= 10; // Penalize low accuracy
    }
  }

  // ========== SPREAD MOVE BONUS (DOUBLES) ==========
  if (isDoubles && isSpreadMove(move)) {
    // Check if hitting multiple targets
    const validTargets = allTargets.filter(t => !t.isFainted);
    if (validTargets.length > 1) {
      priority += 20;
      reasoning += ' (spread damage)';

      // Check if we're hitting our own ally (Earthquake etc)
      if (allies.length > 0) {
        const allyDamage = allies.reduce((sum, ally) => {
          const calc = calculateDamageV2(attacker, ally, move, field, isDoubles, []);
          return sum + calc.damage;
        }, 0);
        if (allyDamage > 0) {
          priority -= 15; // Penalize hitting ally
        }
      }
    }
  }

  // ========== STATUS MOVES ==========
  if (move.category === 'status') {
    priority = evaluateStatusMove(attacker, defender, move, field, allies, allTargets);
  }

  // ========== PROTECT LOGIC ==========
  if (move.name.toLowerCase().includes('protect') || move.name.toLowerCase() === 'detect') {
    priority = evaluateProtect(attacker, defender, allTargets, field);
  }

  // ========== META AWARENESS ==========
  const targetUsage = getUsageData(defender.name);
  if (targetUsage && targetUsage.tier === 'S') {
    priority += 10; // Prioritize threatening S-tier Pokemon
  }

  return {
    action: createMoveAction(0, moveIndex, targetIndex),
    reasoning,
    priority: Math.max(0, Math.min(200, priority))
  };
}

// ============================================
// STATUS MOVE EVALUATION
// ============================================

function evaluateStatusMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move,
  field: FieldState,
  allies: BattlePokemon[],
  enemies: BattlePokemon[]
): number {
  const moveName = move.name.toLowerCase().replace(/\s+/g, '-');
  let priority = 40;

  // Tailwind - very valuable in VGC
  if (moveName === 'tailwind') {
    const side = field.aiSide;
    if (side.tailwind <= 0) {
      priority = 85;
    } else {
      priority = 10; // Already have Tailwind
    }
  }

  // Trick Room
  if (moveName === 'trick-room') {
    const side = field.aiSide;
    if (side.trickRoom <= 0) {
      // Check if our team benefits from Trick Room
      const avgSpeed = attacker.stats.speed;
      if (avgSpeed < 60) {
        priority = 90; // Slow team benefits
      } else {
        priority = 30; // Fast team doesn't want TR
      }
    }
  }

  // Fake Out - always good turn 1
  if (moveName === 'fake-out') {
    if (!attacker.lastMoveUsed) { // First turn
      priority = 80;
    } else {
      priority = 0; // Can only use turn 1
    }
  }

  // Thunder Wave / Glare
  if (['thunder-wave', 'glare', 'stun-spore'].includes(moveName)) {
    if (defender.status.name === null && !defender.types.includes('electric') && !defender.types.includes('ground')) {
      priority = 55;
      // High priority against fast threats
      if (defender.stats.speed > 100) {
        priority = 70;
      }
    } else {
      priority = 0;
    }
  }

  // Will-O-Wisp
  if (moveName === 'will-o-wisp') {
    if (defender.status.name === null && !defender.types.includes('fire')) {
      priority = 50;
      // High priority against physical attackers
      if (defender.stats.attack > defender.stats.specialAttack) {
        priority = 65;
      }
    } else {
      priority = 0;
    }
  }

  // Spore / Sleep Powder / Hypnosis
  if (['spore', 'sleep-powder', 'hypnosis', 'lovely-kiss', 'sing'].includes(moveName)) {
    if (defender.status.name === null) {
      priority = 75;
      // Check Grass immunity
      if (defender.types.includes('grass') || defender.activeAbility === 'insomnia' || defender.activeAbility === 'vital-spirit') {
        priority = 0;
      }
      // Check Safety Goggles
      if (defender.heldItem?.id === 'safety-goggles') {
        priority = 0;
      }
    } else {
      priority = 0;
    }
  }

  // Helping Hand
  if (moveName === 'helping-hand' && allies.length > 0) {
    // Check if ally is about to use a powerful move
    priority = 60;
  }

  // Screens
  if (['reflect', 'light-screen', 'aurora-veil'].includes(moveName)) {
    const side = field.aiSide;
    if (moveName === 'reflect' && side.reflect <= 0) {
      priority = 55;
    } else if (moveName === 'light-screen' && side.lightScreen <= 0) {
      priority = 55;
    } else if (moveName === 'aurora-veil' && side.auroraVeil <= 0 && ['hail', 'snow'].includes(field.weather || '')) {
      priority = 70;
    } else {
      priority = 5;
    }
  }

  // Setup moves
  if (['swords-dance', 'dragon-dance', 'nasty-plot', 'calm-mind', 'quiver-dance', 'shell-smash'].includes(moveName)) {
    // Only setup if we're not about to die
    const threats = enemies.filter(e => !e.isFainted);
    const isInDanger = threats.some(t => {
      const moves = t.selectedMoves;
      return moves.some(m => {
        const calc = calculateDamageV2(t, attacker, m, field, true, []);
        return calc.koChance > 50;
      });
    });

    if (!isInDanger) {
      priority = 65;
    } else {
      priority = 20;
    }
  }

  // Taunt - against support Pokemon
  if (moveName === 'taunt') {
    const targetUsage = getUsageData(defender.name);
    if (targetUsage?.role.includes('support')) {
      priority = 70;
    } else {
      priority = 40;
    }
  }

  return priority;
}

// ============================================
// PROTECT EVALUATION
// ============================================

function evaluateProtect(
  user: BattlePokemon,
  target: BattlePokemon,
  allEnemies: BattlePokemon[],
  field: FieldState
): number {
  let priority = 30;

  // Check if we're likely to be targeted
  const isLikelyTarget = allEnemies.some(enemy => {
    const moves = enemy.selectedMoves;
    return moves.some(m => {
      const calc = calculateDamageV2(enemy, user, m, field, true, []);
      return calc.koChance > 30;
    });
  });

  if (isLikelyTarget) {
    priority = 60;
  }

  // Protect is more valuable when Tailwind is about to end
  if (field.aiSide.tailwind === 1) {
    priority += 10;
  }

  // Protect less valuable if used recently
  if (user.protectCount > 0) {
    priority *= Math.pow(0.33, user.protectCount);
  }

  // Protect while waiting for Trick Room to end
  if (field.playerSide.trickRoom > 0 && user.stats.speed > 80) {
    priority += 15;
  }

  return priority;
}

// ============================================
// SWITCH EVALUATION
// ============================================

function evaluateSwitchDecision(
  currentPokemon: BattlePokemon,
  aiTeam: BattleTeam,
  playerActive: BattlePokemon[],
  field: FieldState
): AIDecision | null {
  const availableSwitches = aiTeam.selectedForBattle.filter(
    p => !p.isFainted && !p.isActive
  );

  if (availableSwitches.length === 0) return null;

  // Calculate threat level of current matchup
  const currentThreat = calculateThreatScore(currentPokemon, playerActive, field);

  // If current threat is low, don't switch
  if (currentThreat < 40) return null;

  // Evaluate each switch option
  const switchOptions = availableSwitches.map((pokemon, idx) => {
    const score = evaluateSwitchIn(pokemon, playerActive, field);
    const switchIdx = aiTeam.selectedForBattle.indexOf(pokemon);

    return {
      pokemon,
      switchIdx,
      score,
      reasoning: `Switch to ${pokemon.name} (score: ${score.toFixed(1)})`
    };
  });

  switchOptions.sort((a, b) => b.score - a.score);

  const bestSwitch = switchOptions[0];

  // Only switch if it's significantly better
  if (bestSwitch && bestSwitch.score > 60 && currentThreat > 50) {
    return {
      action: {
        type: 'switch',
        pokemonIndex: 0,
        switchToIndex: bestSwitch.switchIdx
      },
      reasoning: bestSwitch.reasoning,
      priority: 70 + (currentThreat * 0.3)
    };
  }

  return null;
}

function calculateThreatScore(
  defender: BattlePokemon,
  attackers: BattlePokemon[],
  field: FieldState
): number {
  let maxThreat = 0;

  attackers.forEach(attacker => {
    attacker.selectedMoves.forEach(move => {
      const calc = calculateDamageV2(attacker, defender, move, field, true, []);
      const threat = calc.koChance;
      maxThreat = Math.max(maxThreat, threat);
    });
  });

  // Add type disadvantage threat
  attackers.forEach(attacker => {
    attacker.types.forEach(type => {
      const eff = getTypeEffectiveness(type, defender.types);
      if (eff > 1) maxThreat += 20;
      if (eff >= 4) maxThreat += 20;
    });
  });

  return Math.min(100, maxThreat);
}

function evaluateSwitchIn(
  switchTarget: BattlePokemon,
  opponents: BattlePokemon[],
  field: FieldState
): number {
  let score = 50;

  // Type matchup
  opponents.forEach(opp => {
    // Defensive matchup
    opp.types.forEach(oppType => {
      const eff = getTypeEffectiveness(oppType, switchTarget.types);
      if (eff < 1) score += 15;
      if (eff === 0) score += 25;
      if (eff > 1) score -= 15;
    });

    // Offensive matchup
    switchTarget.types.forEach(myType => {
      const eff = getTypeEffectiveness(myType, opp.types);
      if (eff > 1) score += 10;
    });
  });

  // HP consideration
  const hpPercent = switchTarget.currentHp / switchTarget.maxHp;
  score += hpPercent * 20;

  // Speed tier
  const avgOppSpeed = opponents.reduce((sum, o) => sum + o.stats.speed, 0) / opponents.length;
  if (switchTarget.stats.speed > avgOppSpeed) {
    score += 10;
  }

  // Check if it's a known counter
  opponents.forEach(opp => {
    const counters = getCounters(opp.name);
    if (counters.includes(switchTarget.name.toLowerCase())) {
      score += 20;
    }
  });

  // Ability synergy with field
  if (switchTarget.activeAbility === 'chlorophyll' && field.weather === 'sun') {
    score += 15;
  } else if (switchTarget.activeAbility === 'swift-swim' && field.weather === 'rain') {
    score += 15;
  } else if (switchTarget.activeAbility === 'sand-rush' && field.weather === 'sandstorm') {
    score += 15;
  }

  // Intimidate value
  if (switchTarget.activeAbility === 'intimidate') {
    const physicalThreat = opponents.some(o => o.stats.attack > o.stats.specialAttack);
    if (physicalThreat) score += 15;
  }

  return Math.min(100, Math.max(0, score));
}

// ============================================
// MECHANIC EVALUATION (DYNAMAX/TERA)
// ============================================

function evaluateMechanicDecisions(
  pokemon: BattlePokemon,
  aiTeam: BattleTeam,
  playerActive: BattlePokemon[],
  field: FieldState
): AIDecision[] {
  const decisions: AIDecision[] = [];

  // Dynamax evaluation
  if (!aiTeam.hasDynamaxed && !pokemon.dynamaxState.isDynamaxed) {
    const dynamaxValue = evaluateDynamax(pokemon, playerActive, field);
    if (dynamaxValue > 70) {
      // Create decisions with Dynamax flag
      pokemon.selectedMoves.forEach((move, moveIndex) => {
        playerActive.forEach((target, targetIndex) => {
          decisions.push({
            action: {
              type: 'move',
              pokemonIndex: 0,
              moveIndex,
              targetIndex,
              useDynamax: true
            },
            reasoning: `Dynamax and use Max Move on ${target.name}`,
            priority: dynamaxValue + 20
          });
        });
      });
    }
  }

  // Terastallization evaluation
  if (!aiTeam.hasTerastallized && !pokemon.teraState.isTerastallized) {
    const teraValue = evaluateTera(pokemon, playerActive, field);
    if (teraValue.value > 60) {
      pokemon.selectedMoves.forEach((move, moveIndex) => {
        playerActive.forEach((target, targetIndex) => {
          decisions.push({
            action: {
              type: 'move',
              pokemonIndex: 0,
              moveIndex,
              targetIndex,
              useTera: true,
              teraType: teraValue.bestType
            },
            reasoning: `Tera ${teraValue.bestType} and use ${move.name}`,
            priority: teraValue.value + 15
          });
        });
      });
    }
  }

  return decisions;
}

function evaluateDynamax(
  pokemon: BattlePokemon,
  opponents: BattlePokemon[],
  field: FieldState
): number {
  let value = 40;

  // HP consideration - Dynamax doubles HP
  const hpPercent = pokemon.currentHp / pokemon.maxHp;
  if (hpPercent > 0.7) {
    value += 20;
  } else if (hpPercent < 0.4) {
    value -= 10; // Less value if already low HP
  }

  // Check if we have good Max Move coverage
  const hasGoodCoverage = pokemon.selectedMoves.some(move => {
    return opponents.some(opp => {
      const eff = getTypeEffectiveness(move.type, opp.types);
      return eff >= 2;
    });
  });
  if (hasGoodCoverage) value += 15;

  // Check if opponent hasn't Dynamaxed yet
  if (!opponents.some(o => o.dynamaxState.isDynamaxed)) {
    value += 10;
  }

  // Consider if we have beneficial Max Move effects
  const hasAirstream = pokemon.selectedMoves.some(m => m.type === 'flying');
  if (hasAirstream) value += 15; // Max Airstream speed boost

  return value;
}

function evaluateTera(
  pokemon: BattlePokemon,
  opponents: BattlePokemon[],
  field: FieldState
): { value: number; bestType: PokemonType } {
  let bestValue = 0;
  let bestType: PokemonType = pokemon.types[0];

  const allTypes: PokemonType[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  allTypes.forEach(type => {
    let value = 0;

    // Offensive boost - check STAB with new type
    pokemon.selectedMoves.forEach(move => {
      if (move.type === type) {
        value += 20;
        opponents.forEach(opp => {
          const eff = getTypeEffectiveness(move.type, opp.types);
          if (eff >= 2) value += 15;
        });
      }
    });

    // Defensive value - immunities and resistances
    opponents.forEach(opp => {
      opp.selectedMoves.forEach(move => {
        if (!move.power) return;
        const newEff = getTypeEffectiveness(move.type, [type]);
        const oldEff = getTypeEffectiveness(move.type, pokemon.types);

        if (newEff === 0 && oldEff > 0) {
          value += 30; // Gained immunity
        } else if (newEff < oldEff) {
          value += 15; // Gained resistance
        } else if (newEff > oldEff) {
          value -= 15; // Lost resistance
        }
      });
    });

    if (value > bestValue) {
      bestValue = value;
      bestType = type;
    }
  });

  return { value: bestValue, bestType };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function canUseMove(pokemon: BattlePokemon, move: Move, field: FieldState): boolean {
  // TODO: Add Taunt check, Disable check, etc.
  if (pokemon.heldItem?.blocksStatusMoves && move.category === 'status') {
    return false;
  }
  return true;
}

function isSpreadMove(move: Move): boolean {
  const spreadMoves = [
    'earthquake', 'surf', 'discharge', 'heat-wave', 'rock-slide',
    'muddy-water', 'dazzling-gleam', 'sludge-wave', 'blizzard',
    'eruption', 'water-spout', 'brutal-swing', 'breaking-swipe',
    'bulldoze', 'icy-wind', 'electroweb', 'snarl', 'struggle-bug'
  ];
  return spreadMoves.includes(move.name.toLowerCase().replace(/\s+/g, '-'));
}

function createMoveAction(pokemonIndex: number, moveIndex: number, targetIndex: number): BattleAction {
  return {
    type: 'move',
    pokemonIndex,
    moveIndex,
    targetIndex
  };
}

function createDefaultDecision(pokemon: BattlePokemon, activeIndex: number): AIDecision {
  return {
    action: {
      type: 'move',
      pokemonIndex: activeIndex,
      moveIndex: 0,
      targetIndex: 0
    },
    reasoning: 'Default move',
    priority: 10
  };
}

// ============================================
// PLAYER ACTION PREDICTION
// ============================================

export function predictPlayerAction(
  playerTeam: BattleTeam,
  aiTeam: BattleTeam,
  field: FieldState
): PredictedAction[] {
  const predictions: PredictedAction[] = [];
  const playerActive = playerTeam.selectedForBattle.filter(p => p.isActive && !p.isFainted);
  const aiActive = aiTeam.selectedForBattle.filter(p => p.isActive && !p.isFainted);

  playerActive.forEach(player => {
    let likelyAction: 'attack' | 'switch' | 'protect' = 'attack';
    let confidence = 0.5;

    // Low HP = likely heal/protect/switch
    if (player.currentHp < player.maxHp * 0.3) {
      likelyAction = 'protect';
      confidence = 0.7;
    }

    // Bad matchup = likely switch
    const threatLevel = calculateThreatScore(player, aiActive, field);
    if (threatLevel > 70) {
      const availableSwitches = playerTeam.selectedForBattle.filter(
        p => !p.isFainted && !p.isActive
      );
      if (availableSwitches.length > 0) {
        likelyAction = 'switch';
        confidence = 0.6;
      }
    }

    predictions.push({
      pokemon: player.name,
      action: likelyAction,
      confidence
    });
  });

  return predictions;
}

interface PredictedAction {
  pokemon: string;
  action: 'attack' | 'switch' | 'protect';
  confidence: number;
}

// ============================================
// TEAM PREVIEW AI
// ============================================

export function selectTeamForBattle(
  fullTeam: BattlePokemon[],
  opponentTeam: BattlePokemon[]
): number[] {
  // Score each Pokemon based on matchup with opponent team
  const scores = fullTeam.map((pokemon, index) => {
    let score = 50;

    // Type matchups
    opponentTeam.forEach(opp => {
      // Offensive
      pokemon.types.forEach(type => {
        const eff = getTypeEffectiveness(type, opp.types);
        if (eff >= 2) score += 10;
      });

      // Defensive
      opp.types.forEach(type => {
        const eff = getTypeEffectiveness(type, pokemon.types);
        if (eff < 1) score += 5;
        if (eff > 1) score -= 5;
      });
    });

    // Usage tier bonus
    const usage = getUsageData(pokemon.name);
    if (usage) {
      if (usage.tier === 'S') score += 15;
      else if (usage.tier === 'A') score += 10;
      else if (usage.tier === 'B') score += 5;
    }

    // Counter bonus
    opponentTeam.forEach(opp => {
      const counters = getCounters(opp.name);
      if (counters.includes(pokemon.name.toLowerCase())) {
        score += 15;
      }
    });

    return { index, score };
  });

  // Sort and select top 4
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 4).map(s => s.index);
}
