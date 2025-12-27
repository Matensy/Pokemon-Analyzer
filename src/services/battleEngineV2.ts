// Enhanced Battle Engine V2 - VGC 2v2 with full mechanics
import {
  BattlePokemon, BattleState, DamageCalculation, StatusCondition,
  FieldState, FieldHazards, SideConditions, ExtendedDamageCalc
} from '../types/battle';
import { Move, PokemonType } from '../types/pokemon';
import { ABILITIES, getAbilityEffect, AbilityEffect } from '../data/abilities';
import { WEATHER_EFFECTS, FIELD_HAZARDS, TERRAINS, WeatherType, getWeatherDamageMultiplier, isImmuneToWeatherDamage, getTerrainBoost } from '../data/weather';

// ============================================
// DAMAGE CALCULATION WITH ALL MODIFIERS
// ============================================

export function calculateDamageV2(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move,
  field: FieldState,
  isDoubleBattle: boolean = true,
  allTargets: BattlePokemon[] = []
): ExtendedDamageCalc {
  // Status moves don't deal damage
  if (!move.power || move.category === 'status') {
    return {
      damage: 0, minDamage: 0, maxDamage: 0, effectiveness: 1, isCritical: false,
      description: `${attacker.name} used ${move.name}!`,
      basePower: 0, stab: false, weatherBoost: 1, terrainBoost: 1,
      abilityModifier: 1, itemModifier: 1, burnPenalty: false, screenReduction: false, koChance: 0
    };
  }

  const level = attacker.level;
  let power = move.power;
  const isPhysical = move.category === 'physical';

  // ========== BASE STATS ==========
  let attack = isPhysical
    ? calculateStat(attacker.stats.attack, attacker.statStages.attack)
    : calculateStat(attacker.stats.specialAttack, attacker.statStages.specialAttack);

  let defense = isPhysical
    ? calculateStat(defender.stats.defense, defender.statStages.defense)
    : calculateStat(defender.stats.specialDefense, defender.statStages.specialDefense);

  // ========== ABILITY MODIFIERS ==========
  let abilityModifier = 1;
  const attackerAbility = getAbilityEffect(attacker.activeAbility);
  const defenderAbility = getAbilityEffect(defender.activeAbility);

  // Attacker abilities
  if (attackerAbility) {
    // Huge Power / Pure Power
    if (['huge-power', 'pure-power'].includes(attackerAbility.id) && isPhysical) {
      attack *= 2;
      abilityModifier *= 2;
    }

    // Hustle
    if (attackerAbility.id === 'hustle' && isPhysical) {
      attack *= 1.5;
      abilityModifier *= 1.5;
    }

    // Guts (when statused)
    if (attackerAbility.id === 'guts' && attacker.status.name && isPhysical) {
      attack *= 1.5;
      abilityModifier *= 1.5;
    }

    // Adaptability (enhanced STAB)
    if (attackerAbility.id === 'adaptability' && attacker.types.includes(move.type)) {
      // Will be applied in STAB section
    }

    // Technician
    if (attackerAbility.id === 'technician' && power <= 60) {
      power = Math.floor(power * 1.5);
      abilityModifier *= 1.5;
    }

    // Tough Claws (contact moves)
    if (attackerAbility.id === 'tough-claws') {
      power = Math.floor(power * 1.3);
      abilityModifier *= 1.3;
    }

    // Sheer Force
    if (attackerAbility.id === 'sheer-force') {
      power = Math.floor(power * 1.3);
      abilityModifier *= 1.3;
    }

    // Solar Power (in sun, special moves)
    if (attackerAbility.id === 'solar-power' && field.weather === 'sun' && !isPhysical) {
      attack *= 1.5;
      abilityModifier *= 1.5;
    }

    // Sand Force (in sandstorm)
    if (attackerAbility.id === 'sand-force' && field.weather === 'sandstorm') {
      if (['rock', 'ground', 'steel'].includes(move.type)) {
        power = Math.floor(power * 1.3);
        abilityModifier *= 1.3;
      }
    }
  }

  // Defender abilities
  if (defenderAbility && !attackerNullifies(attackerAbility)) {
    // Multiscale / Shadow Shield (full HP halves damage)
    if (['multiscale', 'shadow-shield'].includes(defenderAbility.id)) {
      if (defender.currentHp >= defender.maxHp) {
        abilityModifier *= 0.5;
      }
    }

    // Fur Coat (halves physical)
    if (defenderAbility.id === 'fur-coat' && isPhysical) {
      defense *= 2;
    }

    // Ice Scales (halves special)
    if (defenderAbility.id === 'ice-scales' && !isPhysical) {
      defense *= 2;
    }

    // Thick Fat (Fire/Ice halved)
    if (defenderAbility.id === 'thick-fat' && ['fire', 'ice'].includes(move.type)) {
      power = Math.floor(power * 0.5);
    }

    // Filter / Solid Rock / Prism Armor (super effective reduced)
    if (['filter', 'solid-rock', 'prism-armor'].includes(defenderAbility.id)) {
      const effectiveness = getTypeEffectiveness(move.type, defender.types);
      if (effectiveness > 1) {
        abilityModifier *= 0.75;
      }
    }

    // Wonder Guard
    if (defenderAbility.id === 'wonder-guard') {
      const effectiveness = getTypeEffectiveness(move.type, defender.types);
      if (effectiveness <= 1) {
        return createNoDamageResult(attacker, move, 'Wonder Guard blocked the attack!');
      }
    }

    // Levitate
    if (defenderAbility.id === 'levitate' && move.type === 'ground') {
      return createNoDamageResult(attacker, move, `${defender.name}'s Levitate makes it immune!`);
    }

    // Type-absorbing abilities
    if (defenderAbility.immuneToType === move.type) {
      if (defenderAbility.healPercent) {
        return createNoDamageResult(attacker, move, `${defender.name}'s ${defenderAbility.name} absorbed the attack!`);
      }
      return createNoDamageResult(attacker, move, `${defender.name}'s ${defenderAbility.name} makes it immune!`);
    }
  }

  // ========== WEATHER MODIFIERS ==========
  let weatherBoost = getWeatherDamageMultiplier(field.weather, move.type);

  // ========== TERRAIN MODIFIERS ==========
  let terrainBoost = 1;
  if (attacker.isGrounded && field.terrain) {
    terrainBoost = getTerrainBoost(field.terrain, move.type, true);
  }

  // ========== ITEM MODIFIERS ==========
  let itemModifier = 1;
  if (attacker.heldItem) {
    const item = attacker.heldItem;

    if (item.id === 'life-orb') {
      itemModifier *= 1.3;
    } else if (item.id === 'choice-band' && isPhysical) {
      attack *= 1.5;
      itemModifier *= 1.5;
    } else if (item.id === 'choice-specs' && !isPhysical) {
      attack *= 1.5;
      itemModifier *= 1.5;
    } else if (item.id === 'muscle-band' && isPhysical) {
      itemModifier *= 1.1;
    } else if (item.id === 'wise-glasses' && !isPhysical) {
      itemModifier *= 1.1;
    } else if (item.id === 'expert-belt') {
      const effectiveness = getTypeEffectiveness(move.type, defender.types);
      if (effectiveness > 1) {
        itemModifier *= 1.2;
      }
    }
  }

  if (defender.heldItem) {
    if (defender.heldItem.id === 'assault-vest' && !isPhysical) {
      defense *= 1.5;
    }
    if (defender.heldItem.id === 'eviolite' && defender.heldItem.requiresEvolution) {
      defense *= 1.5;
    }
  }

  // ========== SCREEN REDUCTION ==========
  let screenReduction = false;
  const defenderSide = field.playerSide; // Would need to determine which side

  if (isPhysical && defenderSide.reflect > 0) {
    defense *= isDoubleBattle ? 1.33 : 2;
    screenReduction = true;
  }
  if (!isPhysical && defenderSide.lightScreen > 0) {
    defense *= isDoubleBattle ? 1.33 : 2;
    screenReduction = true;
  }
  if (defenderSide.auroraVeil > 0) {
    defense *= isDoubleBattle ? 1.33 : 2;
    screenReduction = true;
  }

  // ========== BASE DAMAGE FORMULA ==========
  let baseDamage = Math.floor(
    Math.floor(
      Math.floor((2 * level) / 5 + 2) * power * (attack / defense)
    ) / 50
  ) + 2;

  // ========== SPREAD MOVE REDUCTION (DOUBLES) ==========
  if (isDoubleBattle && isSpreadMove(move) && allTargets.length > 1) {
    baseDamage = Math.floor(baseDamage * 0.75);
  }

  // ========== WEATHER ==========
  baseDamage = Math.floor(baseDamage * weatherBoost);

  // ========== STAB ==========
  let stab = false;
  if (attacker.types.includes(move.type)) {
    stab = true;
    const stabMultiplier = attackerAbility?.id === 'adaptability' ? 2.0 : 1.5;
    baseDamage = Math.floor(baseDamage * stabMultiplier);
  }

  // ========== TYPE EFFECTIVENESS ==========
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  baseDamage = Math.floor(baseDamage * effectiveness);

  // ========== BURN PENALTY ==========
  let burnPenalty = false;
  if (attacker.status.name === 'burn' && isPhysical) {
    // Guts negates burn penalty
    if (attackerAbility?.id !== 'guts') {
      baseDamage = Math.floor(baseDamage * 0.5);
      burnPenalty = true;
    }
  }

  // ========== CRITICAL HIT ==========
  let critChance = 0.0625; // 1/16 = 6.25%
  if (attacker.heldItem?.critBoost) {
    critChance = 0.125; // 1/8
  }
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  // ========== TERRAIN ==========
  baseDamage = Math.floor(baseDamage * terrainBoost);

  // ========== RANDOM FACTOR ==========
  const minRandom = 0.85;
  const maxRandom = 1.0;
  const randomFactor = minRandom + Math.random() * (maxRandom - minRandom);
  const finalDamage = Math.floor(baseDamage * randomFactor);

  // Calculate min/max for display
  const minDamage = Math.max(1, Math.floor(baseDamage * minRandom));
  const maxDamage = Math.max(1, Math.floor(baseDamage * maxRandom));
  const damage = Math.max(1, finalDamage);

  // ========== KO CHANCE ==========
  const koChance = calculateKOChance(minDamage, maxDamage, defender.currentHp);

  // ========== DESCRIPTION ==========
  let description = `${attacker.name} used ${move.name}!`;
  if (isCritical) description += ' A critical hit!';
  if (effectiveness > 1) description += " It's super effective!";
  if (effectiveness < 1 && effectiveness > 0) description += " It's not very effective...";
  if (effectiveness === 0) description = `It doesn't affect ${defender.name}...`;

  return {
    damage,
    minDamage,
    maxDamage,
    effectiveness,
    isCritical,
    description,
    basePower: move.power,
    stab,
    weatherBoost,
    terrainBoost,
    abilityModifier,
    itemModifier,
    burnPenalty,
    screenReduction,
    koChance
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateStat(baseStat: number, stage: number): number {
  const stageMultiplier = stage >= 0
    ? (2 + stage) / 2
    : 2 / (2 - stage);
  return Math.floor(baseStat * stageMultiplier);
}

function getTypeEffectiveness(moveType: PokemonType, defenderTypes: PokemonType[]): number {
  let effectiveness = 1;
  defenderTypes.forEach(type => {
    effectiveness *= getTypeDamageMultiplier(moveType, type);
  });
  return effectiveness;
}

function getTypeDamageMultiplier(attackType: PokemonType, defendType: PokemonType): number {
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

function attackerNullifies(ability: AbilityEffect | null): boolean {
  if (!ability) return false;
  return ['mold-breaker', 'teravolt', 'turboblaze'].includes(ability.id);
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

function createNoDamageResult(attacker: BattlePokemon, move: Move, description: string): ExtendedDamageCalc {
  return {
    damage: 0, minDamage: 0, maxDamage: 0, effectiveness: 0, isCritical: false,
    description: `${attacker.name} used ${move.name}! ${description}`,
    basePower: move.power || 0, stab: false, weatherBoost: 1, terrainBoost: 1,
    abilityModifier: 1, itemModifier: 1, burnPenalty: false, screenReduction: false, koChance: 0
  };
}

function calculateKOChance(minDamage: number, maxDamage: number, targetHp: number): number {
  if (minDamage >= targetHp) return 100;
  if (maxDamage < targetHp) return 0;

  // Linear interpolation
  const range = maxDamage - minDamage;
  if (range === 0) return minDamage >= targetHp ? 100 : 0;

  const koThreshold = targetHp - minDamage;
  const koChance = ((range - koThreshold) / range) * 100;
  return Math.min(100, Math.max(0, Math.round(koChance)));
}

// ============================================
// ENTRY HAZARDS SYSTEM
// ============================================

export function applyEntryHazards(
  pokemon: BattlePokemon,
  hazards: FieldHazards,
  logs: string[]
): void {
  // Heavy-Duty Boots immunity
  if (pokemon.heldItem?.id === 'heavy-duty-boots') {
    return;
  }

  // Magic Guard immunity
  if (pokemon.activeAbility === 'magic-guard') {
    return;
  }

  // Stealth Rock
  if (hazards.stealthRock) {
    const effectiveness = getTypeEffectiveness('rock', pokemon.types);
    const damage = Math.floor(pokemon.maxHp * (effectiveness * 0.125));
    if (damage > 0) {
      applyDamage(pokemon, damage);
      logs.push(`Pointed stones dug into ${pokemon.name}! (${damage} damage)`);
    }
  }

  // Spikes (ground-based)
  if (hazards.spikesLayers > 0 && pokemon.isGrounded) {
    const damagePercent = [0.125, 0.1667, 0.25][hazards.spikesLayers - 1];
    const damage = Math.floor(pokemon.maxHp * damagePercent);
    applyDamage(pokemon, damage);
    logs.push(`${pokemon.name} was hurt by the spikes! (${damage} damage)`);
  }

  // Toxic Spikes (ground-based)
  if (hazards.toxicSpikesLayers > 0 && pokemon.isGrounded) {
    // Poison types absorb Toxic Spikes
    if (pokemon.types.includes('poison')) {
      hazards.toxicSpikesLayers = 0;
      logs.push(`${pokemon.name} absorbed the Toxic Spikes!`);
    } else if (!pokemon.types.includes('steel') && !pokemon.types.includes('flying')) {
      const status: StatusCondition = {
        name: hazards.toxicSpikesLayers === 1 ? 'poison' : 'badly-poison',
        turnsRemaining: hazards.toxicSpikesLayers === 2 ? 1 : undefined
      };
      if (pokemon.status.name === null) {
        pokemon.status = status;
        logs.push(`${pokemon.name} was ${status.name === 'badly-poison' ? 'badly poisoned' : 'poisoned'} by Toxic Spikes!`);
      }
    }
  }

  // Sticky Web (ground-based)
  if (hazards.stickyWeb && pokemon.isGrounded) {
    if (!['clear-body', 'white-smoke'].includes(pokemon.activeAbility)) {
      pokemon.statStages.speed = Math.max(-6, pokemon.statStages.speed - 1);
      logs.push(`${pokemon.name}'s Speed was lowered by Sticky Web!`);

      // Defiant/Competitive trigger
      if (pokemon.activeAbility === 'defiant') {
        pokemon.statStages.attack = Math.min(6, pokemon.statStages.attack + 2);
        logs.push(`${pokemon.name}'s Defiant raised its Attack!`);
      } else if (pokemon.activeAbility === 'competitive') {
        pokemon.statStages.specialAttack = Math.min(6, pokemon.statStages.specialAttack + 2);
        logs.push(`${pokemon.name}'s Competitive raised its Sp. Atk!`);
      }
    }
  }
}

// ============================================
// WEATHER SYSTEM
// ============================================

export function setWeather(
  field: FieldState,
  weather: WeatherType,
  turns: number,
  logs: string[]
): void {
  field.weather = weather;
  field.weatherTurns = turns;

  if (weather) {
    const effect = WEATHER_EFFECTS[weather];
    logs.push(effect?.description || `The weather changed to ${weather}!`);
  } else {
    logs.push('The weather returned to normal.');
  }
}

export function processWeatherEndOfTurn(
  field: FieldState,
  allPokemon: BattlePokemon[],
  logs: string[]
): void {
  if (!field.weather || field.weatherTurns <= 0) return;

  const effect = WEATHER_EFFECTS[field.weather];

  // Weather damage (sandstorm, hail)
  if (effect?.damagePercent) {
    allPokemon.forEach(pokemon => {
      if (pokemon.isFainted || !pokemon.isActive) return;

      // Check immunity
      if (isImmuneToWeatherDamage(field.weather, pokemon.types)) return;
      if (pokemon.activeAbility === 'magic-guard') return;
      if (pokemon.activeAbility === 'sand-veil' && field.weather === 'sandstorm') return;
      if (pokemon.activeAbility === 'snow-cloak' && field.weather === 'snow') return;
      if (pokemon.activeAbility === 'overcoat') return;
      if (pokemon.heldItem?.id === 'safety-goggles') return;

      const damage = Math.floor(pokemon.maxHp * ((effect.damagePercent || 0) / 100));
      applyDamage(pokemon, damage);
      logs.push(`${pokemon.name} is buffeted by the ${field.weather}! (${damage} damage)`);
    });
  }

  // Weather-based healing
  allPokemon.forEach(pokemon => {
    if (pokemon.isFainted || !pokemon.isActive) return;

    // Rain Dish
    if (pokemon.activeAbility === 'rain-dish' && field.weather === 'rain') {
      const heal = Math.floor(pokemon.maxHp * 0.0625);
      healPokemon(pokemon, heal);
      logs.push(`${pokemon.name}'s Rain Dish restored HP!`);
    }

    // Ice Body
    if (pokemon.activeAbility === 'ice-body' && ['hail', 'snow'].includes(field.weather || '')) {
      const heal = Math.floor(pokemon.maxHp * 0.0625);
      healPokemon(pokemon, heal);
      logs.push(`${pokemon.name}'s Ice Body restored HP!`);
    }

    // Dry Skin
    if (pokemon.activeAbility === 'dry-skin') {
      if (field.weather === 'rain') {
        const heal = Math.floor(pokemon.maxHp * 0.125);
        healPokemon(pokemon, heal);
        logs.push(`${pokemon.name}'s Dry Skin restored HP!`);
      } else if (field.weather === 'sun') {
        const damage = Math.floor(pokemon.maxHp * 0.125);
        applyDamage(pokemon, damage);
        logs.push(`${pokemon.name}'s Dry Skin damaged it in the sun!`);
      }
    }

    // Solar Power damage
    if (pokemon.activeAbility === 'solar-power' && field.weather === 'sun') {
      const damage = Math.floor(pokemon.maxHp * 0.125);
      applyDamage(pokemon, damage);
      logs.push(`${pokemon.name}'s Solar Power damaged it!`);
    }
  });

  // Decrement weather turns
  field.weatherTurns--;
  if (field.weatherTurns <= 0) {
    logs.push(`The ${field.weather} subsided.`);
    field.weather = null;
  }
}

// ============================================
// TERRAIN SYSTEM
// ============================================

export function setTerrain(
  field: FieldState,
  terrain: 'electric' | 'grassy' | 'misty' | 'psychic' | null,
  turns: number,
  logs: string[]
): void {
  field.terrain = terrain;
  field.terrainTurns = turns;

  if (terrain) {
    const effect = TERRAINS[terrain];
    logs.push(effect?.description || `${terrain} terrain appeared!`);
  } else {
    logs.push('The terrain returned to normal.');
  }
}

export function processTerrainEndOfTurn(
  field: FieldState,
  allPokemon: BattlePokemon[],
  logs: string[]
): void {
  if (!field.terrain || field.terrainTurns <= 0) return;

  // Grassy Terrain healing
  if (field.terrain === 'grassy') {
    allPokemon.forEach(pokemon => {
      if (pokemon.isFainted || !pokemon.isActive || !pokemon.isGrounded) return;

      const heal = Math.floor(pokemon.maxHp * 0.0625);
      healPokemon(pokemon, heal);
      logs.push(`${pokemon.name} was healed by Grassy Terrain!`);
    });
  }

  // Decrement terrain turns
  field.terrainTurns--;
  if (field.terrainTurns <= 0) {
    logs.push(`The ${field.terrain} terrain faded.`);
    field.terrain = null;
  }
}

// ============================================
// ABILITY TRIGGERS
// ============================================

export function triggerSwitchInAbilities(
  pokemon: BattlePokemon,
  opponents: BattlePokemon[],
  field: FieldState,
  logs: string[]
): void {
  const ability = getAbilityEffect(pokemon.activeAbility);
  if (!ability) return;

  // Weather setters
  if (ability.weather) {
    setWeather(field, ability.weather, 5, logs);
  }

  // Terrain setters
  if (ability.terrain) {
    setTerrain(field, ability.terrain, 5, logs);
  }

  // Intimidate
  if (ability.id === 'intimidate') {
    opponents.forEach(opp => {
      if (opp.isFainted || !opp.isActive) return;

      // Inner Focus immunity
      if (opp.activeAbility === 'inner-focus') {
        logs.push(`${opp.name}'s Inner Focus prevents Intimidate!`);
        return;
      }

      // Clear Body/White Smoke
      if (['clear-body', 'white-smoke'].includes(opp.activeAbility)) {
        logs.push(`${opp.name}'s ${opp.activeAbility} prevents stat drops!`);
        return;
      }

      opp.statStages.attack = Math.max(-6, opp.statStages.attack - 1);
      logs.push(`${pokemon.name}'s Intimidate lowered ${opp.name}'s Attack!`);

      // Defiant/Competitive
      if (opp.activeAbility === 'defiant') {
        opp.statStages.attack = Math.min(6, opp.statStages.attack + 2);
        logs.push(`${opp.name}'s Defiant sharply raised its Attack!`);
      } else if (opp.activeAbility === 'competitive') {
        opp.statStages.specialAttack = Math.min(6, opp.statStages.specialAttack + 2);
        logs.push(`${opp.name}'s Competitive sharply raised its Sp. Atk!`);
      }
    });
  }

  // Download
  if (ability.id === 'download') {
    const avgDef = opponents.reduce((sum, o) => sum + o.stats.defense, 0) / opponents.length;
    const avgSpDef = opponents.reduce((sum, o) => sum + o.stats.specialDefense, 0) / opponents.length;

    if (avgDef < avgSpDef) {
      pokemon.statStages.attack = Math.min(6, pokemon.statStages.attack + 1);
      logs.push(`${pokemon.name}'s Download raised its Attack!`);
    } else {
      pokemon.statStages.specialAttack = Math.min(6, pokemon.statStages.specialAttack + 1);
      logs.push(`${pokemon.name}'s Download raised its Sp. Atk!`);
    }
  }
}

export function triggerEndOfTurnAbilities(
  pokemon: BattlePokemon,
  logs: string[]
): void {
  if (pokemon.isFainted) return;

  const ability = getAbilityEffect(pokemon.activeAbility);
  if (!ability) return;

  // Speed Boost
  if (ability.id === 'speed-boost') {
    if (pokemon.statStages.speed < 6) {
      pokemon.statStages.speed++;
      logs.push(`${pokemon.name}'s Speed Boost raised its Speed!`);
    }
  }

  // Poison Heal
  if (ability.id === 'poison-heal' && ['poison', 'badly-poison'].includes(pokemon.status.name || '')) {
    const heal = Math.floor(pokemon.maxHp * 0.125);
    healPokemon(pokemon, heal);
    logs.push(`${pokemon.name}'s Poison Heal restored HP!`);
    return; // Skip normal poison damage
  }
}

// ============================================
// SPEED CALCULATION
// ============================================

export function calculateEffectiveSpeed(
  pokemon: BattlePokemon,
  field: FieldState,
  sideConditions: SideConditions
): number {
  let speed = calculateStat(pokemon.stats.speed, pokemon.statStages.speed);

  // Paralysis
  if (pokemon.status.name === 'paralysis') {
    speed = Math.floor(speed * 0.5);
  }

  // Choice Scarf
  if (pokemon.heldItem?.id === 'choice-scarf') {
    speed = Math.floor(speed * 1.5);
  }

  // Weather speed abilities
  const ability = getAbilityEffect(pokemon.activeAbility);
  if (ability) {
    if (ability.id === 'chlorophyll' && field.weather === 'sun') {
      speed *= 2;
    } else if (ability.id === 'swift-swim' && field.weather === 'rain') {
      speed *= 2;
    } else if (ability.id === 'sand-rush' && field.weather === 'sandstorm') {
      speed *= 2;
    } else if (ability.id === 'slush-rush' && ['hail', 'snow'].includes(field.weather || '')) {
      speed *= 2;
    }
  }

  // Tailwind
  if (sideConditions.tailwind > 0) {
    speed *= 2;
  }

  return Math.floor(speed);
}

// ============================================
// BASIC ACTIONS
// ============================================

export function applyDamage(pokemon: BattlePokemon, damage: number): void {
  // Focus Sash
  if (pokemon.currentHp >= pokemon.maxHp && damage >= pokemon.currentHp && pokemon.heldItem?.id === 'focus-sash') {
    pokemon.currentHp = 1;
    pokemon.heldItem = undefined; // Consumed
    return;
  }

  // Sturdy
  if (pokemon.currentHp >= pokemon.maxHp && damage >= pokemon.currentHp && pokemon.activeAbility === 'sturdy') {
    pokemon.currentHp = 1;
    return;
  }

  pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
  if (pokemon.currentHp === 0) {
    pokemon.isFainted = true;
    pokemon.isActive = false;
  }
}

export function healPokemon(pokemon: BattlePokemon, amount: number): number {
  const oldHp = pokemon.currentHp;
  pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + amount);
  return pokemon.currentHp - oldHp;
}

export function applyStatus(pokemon: BattlePokemon, status: StatusCondition): boolean {
  if (pokemon.status.name !== null) return false;

  // Type immunities
  if (status.name === 'burn' && pokemon.types.includes('fire')) return false;
  if ((status.name === 'poison' || status.name === 'badly-poison') &&
      (pokemon.types.includes('poison') || pokemon.types.includes('steel'))) return false;
  if (status.name === 'paralysis' && pokemon.types.includes('electric')) return false;
  if (status.name === 'freeze' && pokemon.types.includes('ice')) return false;

  // Ability immunities
  const ability = getAbilityEffect(pokemon.activeAbility);
  if (ability?.immuneToStatus?.includes(status.name || '')) return false;

  pokemon.status = status;
  return true;
}

// ============================================
// FIELD INITIALIZATION
// ============================================

export function createInitialFieldState(): FieldState {
  return {
    weather: null,
    weatherTurns: 0,
    terrain: null,
    terrainTurns: 0,
    playerSide: createInitialSideConditions(),
    aiSide: createInitialSideConditions()
  };
}

export function createInitialSideConditions(): SideConditions {
  return {
    hazards: {
      stealthRock: false,
      spikesLayers: 0,
      toxicSpikesLayers: 0,
      stickyWeb: false
    },
    reflect: 0,
    lightScreen: 0,
    auroraVeil: 0,
    tailwind: 0,
    trickRoom: 0
  };
}

// Export original functions for backward compatibility
export { calculateStat, getTypeEffectiveness, getTypeDamageMultiplier };
