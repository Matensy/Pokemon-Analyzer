import { AIDecision, BattleTeam } from '../types/battle';
import { Move, PokemonType } from '../types/pokemon';
import { calculateDamage } from './battleEngine';
import type { BattlePokemon } from '../types/battle';

// Advanced Battle AI - Makes intelligent decisions

export function getAIAction(
  aiTeam: BattleTeam,
  playerTeam: BattleTeam
): AIDecision {
  const aiActive = aiTeam.selectedForBattle.find(p => p.isActive)!;
  const playerActive = playerTeam.selectedForBattle.find(p => p.isActive)!;

  // Decision tree
  const decisions: AIDecision[] = [];

  // 1. Check if should switch (priority system)
  const switchDecision = evaluateSwitchOptions(aiTeam, playerActive, aiActive);
  if (switchDecision) {
    decisions.push(switchDecision);
  }

  // 2. Evaluate all moves
  aiActive.selectedMoves.forEach((move, moveIndex) => {
    const moveDecision = evaluateMove(aiActive, playerActive, move, moveIndex);
    decisions.push(moveDecision);
  });

  // 3. Sort by priority and pick best
  decisions.sort((a, b) => b.priority - a.priority);

  return decisions[0] || {
    action: {
      type: 'move',
      pokemonIndex: 0,
      moveIndex: 0,
      targetIndex: 0
    },
    reasoning: 'Default move',
    priority: 0
  };
}

function evaluateSwitchOptions(
  aiTeam: BattleTeam,
  playerActive: BattlePokemon,
  aiActive: BattlePokemon
): AIDecision | null {
  const availableSwitches = aiTeam.selectedForBattle.filter(
    p => !p.isFainted && !p.isActive
  );

  if (availableSwitches.length === 0) return null;

  // Calculate threat level of current matchup
  const threatLevel = calculateThreatLevel(aiActive, playerActive);

  // If threat is high, consider switching
  if (threatLevel >= 70) {
    // Find best switch
    const switchScores = availableSwitches.map((pokemon, index) => ({
      pokemon,
      index,
      score: evaluateSwitchIn(pokemon, playerActive)
    }));

    switchScores.sort((a, b) => b.score - a.score);

    const best = switchScores[0];
    if (best.score > 60) {
      return {
        action: {
          type: 'switch',
          pokemonIndex: 0,
          switchToIndex: aiTeam.selectedForBattle.indexOf(best.pokemon)
        },
        reasoning: `Switch to ${best.pokemon.name} to counter ${playerActive.name}`,
        priority: 90 + best.score / 10
      };
    }
  }

  // Defensive switch if low HP
  if (aiActive.currentHp < aiActive.maxHp * 0.3) {
    const bestDefensiveSwitch = availableSwitches
      .map((p, index) => ({
        pokemon: p,
        index,
        score: evaluateDefensiveSwitch(p, playerActive)
      }))
      .sort((a, b) => b.score - a.score)[0];

    if (bestDefensiveSwitch && bestDefensiveSwitch.score > 50) {
      return {
        action: {
          type: 'switch',
          pokemonIndex: 0,
          switchToIndex: aiTeam.selectedForBattle.indexOf(bestDefensiveSwitch.pokemon)
        },
        reasoning: `Defensive switch to preserve ${aiActive.name}`,
        priority: 80
      };
    }
  }

  return null;
}

function calculateThreatLevel(defender: BattlePokemon, attacker: BattlePokemon): number {
  let threat = 0;

  // Type disadvantage
  const defenderTypes = defender.types;
  const attackerTypes = attacker.types;

  attackerTypes.forEach(atkType => {
    defenderTypes.forEach(defType => {
      const effectiveness = getTypeEffectiveness(atkType, defType);
      if (effectiveness > 1) threat += 30;
      if (effectiveness === 4) threat += 40;
    });
  });

  // Speed disadvantage
  const effectiveSpeedAI = calculateEffectiveSpeed(defender);
  const effectiveSpeedPlayer = calculateEffectiveSpeed(attacker);

  if (effectiveSpeedPlayer > effectiveSpeedAI) {
    threat += 20;
  }

  // HP check
  if (defender.currentHp < defender.maxHp * 0.4) {
    threat += 30;
  }

  return Math.min(100, threat);
}

function evaluateSwitchIn(switchTarget: BattlePokemon, opponent: BattlePokemon): number {
  let score = 50;

  // Type advantage
  switchTarget.types.forEach(defType => {
    opponent.types.forEach(atkType => {
      const effectiveness = getTypeEffectiveness(atkType, defType);
      if (effectiveness < 1) score += 25;
      if (effectiveness === 0) score += 50;
      if (effectiveness > 1) score -= 25;
    });
  });

  // Speed advantage
  if (calculateEffectiveSpeed(switchTarget) > calculateEffectiveSpeed(opponent)) {
    score += 15;
  }

  // HP consideration
  const hpPercent = (switchTarget.currentHp / switchTarget.maxHp) * 100;
  score += hpPercent / 5;

  return Math.min(100, Math.max(0, score));
}

function evaluateDefensiveSwitch(switchTarget: BattlePokemon, opponent: BattlePokemon): number {
  let score = 40;

  // Prioritize high HP
  const hpPercent = (switchTarget.currentHp / switchTarget.maxHp) * 100;
  score += hpPercent / 3;

  // Type resistance
  switchTarget.types.forEach(defType => {
    opponent.types.forEach(atkType => {
      const effectiveness = getTypeEffectiveness(atkType, defType);
      if (effectiveness < 1) score += 20;
      if (effectiveness === 0) score += 40;
    });
  });

  // Defensive stats
  const avgDefense = (switchTarget.stats.defense + switchTarget.stats.specialDefense) / 2;
  score += avgDefense / 10;

  return Math.min(100, score);
}

function evaluateMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move,
  moveIndex: number
): AIDecision {
  let priority = 50;
  let reasoning = `Use ${move.name}`;

  // Calculate expected damage
  const damageCalc = calculateDamage(attacker, defender, move);
  const damagePercent = (damageCalc.damage / defender.maxHp) * 100;

  // Damage priority
  priority += damagePercent / 2;

  // Type effectiveness bonus
  priority += (damageCalc.effectiveness - 1) * 30;

  // KO potential
  if (damageCalc.damage >= defender.currentHp) {
    priority += 50;
    reasoning = `KO ${defender.name} with ${move.name}`;
  } else if (damageCalc.damage >= defender.currentHp * 0.7) {
    priority += 25;
    reasoning = `Heavy damage to ${defender.name} with ${move.name}`;
  }

  // STAB bonus
  if (attacker.types.includes(move.type)) {
    priority += 10;
  }

  // Move accuracy consideration
  const accuracy = move.accuracy || 100;
  priority *= accuracy / 100;

  // Critical hit consideration
  if (damageCalc.isCritical) {
    priority += 15;
  }

  // Status move handling
  if (!move.power) {
    priority = 30; // Lower priority for status moves unless specific conditions
    reasoning = `Setup with ${move.name}`;
  }

  return {
    action: {
      type: 'move',
      pokemonIndex: 0,
      moveIndex,
      targetIndex: 0
    },
    reasoning,
    priority: Math.min(100, priority)
  };
}

function calculateEffectiveSpeed(pokemon: BattlePokemon): number {
  let speed = pokemon.stats.speed;

  // Apply stat stages
  const stageMultiplier = pokemon.statStages.speed >= 0
    ? (2 + pokemon.statStages.speed) / 2
    : 2 / (2 - pokemon.statStages.speed);

  speed *= stageMultiplier;

  // Status conditions
  if (pokemon.status.name === 'paralysis') {
    speed *= 0.5;
  }

  // Item effects (simplified)
  if (pokemon.heldItem?.id === 'choice-scarf') {
    speed *= 1.5;
  }

  return Math.floor(speed);
}

function getTypeEffectiveness(attackType: PokemonType, defendType: PokemonType): number {
  const chart: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };

  return chart[attackType]?.[defendType] ?? 1;
}

// Predict player's likely action
export function predictPlayerAction(
  playerTeam: BattleTeam,
  aiTeam: BattleTeam
): 'attack' | 'switch' | 'item' {
  const playerActive = playerTeam.selectedForBattle.find(p => p.isActive)!;
  const aiActive = aiTeam.selectedForBattle.find(p => p.isActive)!;

  // Low HP = likely heal
  if (playerActive.currentHp < playerActive.maxHp * 0.3) {
    return 'item';
  }

  // Bad matchup = likely switch
  const threatToPlayer = calculateThreatLevel(playerActive, aiActive);
  if (threatToPlayer > 70) {
    return 'switch';
  }

  return 'attack';
}
