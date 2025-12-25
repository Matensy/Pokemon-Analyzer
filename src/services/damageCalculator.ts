import { Pokemon, PokemonType } from '../types/pokemon';

// Type effectiveness chart
const typeChart: Record<PokemonType, Record<PokemonType, number>> = {
  normal: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  fire: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1 },
  water: { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  electric: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  grass: { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1 },
  ice: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1 },
  fighting: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5 },
  poison: { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2 },
  ground: { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1 },
  flying: { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  psychic: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1 },
  bug: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  ghost: { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1 },
  dragon: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0 },
  dark: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 0.5 },
  steel: { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2 },
  fairy: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1 },
};

export interface DamageCalculation {
  damage: number;
  minDamage: number;
  maxDamage: number;
  effectiveness: number;
  isCritical: boolean;
  isSTAB: boolean;
  damagePercent: number;
}

export interface Move {
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number;
  accuracy: number;
  pp: number;
}

// Common competitive moves with their data
export const competitiveMoves: Record<string, Move> = {
  // Physical moves
  'earthquake': { name: 'Earthquake', type: 'ground', category: 'physical', power: 100, accuracy: 100, pp: 10 },
  'close-combat': { name: 'Close Combat', type: 'fighting', category: 'physical', power: 120, accuracy: 100, pp: 5 },
  'stone-edge': { name: 'Stone Edge', type: 'rock', category: 'physical', power: 100, accuracy: 80, pp: 5 },
  'outrage': { name: 'Outrage', type: 'dragon', category: 'physical', power: 120, accuracy: 100, pp: 10 },
  'iron-head': { name: 'Iron Head', type: 'steel', category: 'physical', power: 80, accuracy: 100, pp: 15 },
  'u-turn': { name: 'U-turn', type: 'bug', category: 'physical', power: 70, accuracy: 100, pp: 20 },
  'play-rough': { name: 'Play Rough', type: 'fairy', category: 'physical', power: 90, accuracy: 90, pp: 10 },
  'ice-shard': { name: 'Ice Shard', type: 'ice', category: 'physical', power: 40, accuracy: 100, pp: 30 },
  'aqua-jet': { name: 'Aqua Jet', type: 'water', category: 'physical', power: 40, accuracy: 100, pp: 20 },
  'extreme-speed': { name: 'Extreme Speed', type: 'normal', category: 'physical', power: 80, accuracy: 100, pp: 5 },
  'brave-bird': { name: 'Brave Bird', type: 'flying', category: 'physical', power: 120, accuracy: 100, pp: 15 },
  'sucker-punch': { name: 'Sucker Punch', type: 'dark', category: 'physical', power: 70, accuracy: 100, pp: 5 },
  'wood-hammer': { name: 'Wood Hammer', type: 'grass', category: 'physical', power: 120, accuracy: 100, pp: 15 },
  'flare-blitz': { name: 'Flare Blitz', type: 'fire', category: 'physical', power: 120, accuracy: 100, pp: 15 },
  'poison-jab': { name: 'Poison Jab', type: 'poison', category: 'physical', power: 80, accuracy: 100, pp: 20 },
  'shadow-claw': { name: 'Shadow Claw', type: 'ghost', category: 'physical', power: 70, accuracy: 100, pp: 15 },
  'zen-headbutt': { name: 'Zen Headbutt', type: 'psychic', category: 'physical', power: 80, accuracy: 90, pp: 15 },

  // Special moves
  'thunderbolt': { name: 'Thunderbolt', type: 'electric', category: 'special', power: 90, accuracy: 100, pp: 15 },
  'ice-beam': { name: 'Ice Beam', type: 'ice', category: 'special', power: 90, accuracy: 100, pp: 10 },
  'flamethrower': { name: 'Flamethrower', type: 'fire', category: 'special', power: 90, accuracy: 100, pp: 15 },
  'hydro-pump': { name: 'Hydro Pump', type: 'water', category: 'special', power: 110, accuracy: 80, pp: 5 },
  'surf': { name: 'Surf', type: 'water', category: 'special', power: 90, accuracy: 100, pp: 15 },
  'psychic': { name: 'Psychic', type: 'psychic', category: 'special', power: 90, accuracy: 100, pp: 10 },
  'shadow-ball': { name: 'Shadow Ball', type: 'ghost', category: 'special', power: 80, accuracy: 100, pp: 15 },
  'moonblast': { name: 'Moonblast', type: 'fairy', category: 'special', power: 95, accuracy: 100, pp: 15 },
  'draco-meteor': { name: 'Draco Meteor', type: 'dragon', category: 'special', power: 130, accuracy: 90, pp: 5 },
  'energy-ball': { name: 'Energy Ball', type: 'grass', category: 'special', power: 90, accuracy: 100, pp: 10 },
  'focus-blast': { name: 'Focus Blast', type: 'fighting', category: 'special', power: 120, accuracy: 70, pp: 5 },
  'sludge-bomb': { name: 'Sludge Bomb', type: 'poison', category: 'special', power: 90, accuracy: 100, pp: 10 },
  'dark-pulse': { name: 'Dark Pulse', type: 'dark', category: 'special', power: 80, accuracy: 100, pp: 15 },
  'flash-cannon': { name: 'Flash Cannon', type: 'steel', category: 'special', power: 80, accuracy: 100, pp: 10 },
  'air-slash': { name: 'Air Slash', type: 'flying', category: 'special', power: 75, accuracy: 95, pp: 15 },
  'bug-buzz': { name: 'Bug Buzz', type: 'bug', category: 'special', power: 90, accuracy: 100, pp: 10 },
  'earth-power': { name: 'Earth Power', type: 'ground', category: 'special', power: 90, accuracy: 100, pp: 10 },
  'thunder': { name: 'Thunder', type: 'electric', category: 'special', power: 110, accuracy: 70, pp: 10 },
  'blizzard': { name: 'Blizzard', type: 'ice', category: 'special', power: 110, accuracy: 70, pp: 5 },
};

/**
 * Calculate damage using Gen 8+ damage formula
 * Damage = ((((2 * Level / 5 + 2) * Power * A/D) / 50) + 2) * Modifier
 * Where Modifier = STAB * Type * Critical * Random * etc.
 */
export function calculateDamage(
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  isCritical: boolean = false,
  level: number = 50
): DamageCalculation {
  // Status moves don't deal damage
  if (move.category === 'status' || move.power === 0) {
    return {
      damage: 0,
      minDamage: 0,
      maxDamage: 0,
      effectiveness: 1,
      isCritical: false,
      isSTAB: false,
      damagePercent: 0,
    };
  }

  // Get attack and defense stats
  const attack = move.category === 'physical'
    ? attacker.stats.attack
    : attacker.stats.specialAttack;

  const defense = move.category === 'physical'
    ? defender.stats.defense
    : defender.stats.specialDefense;

  // Base damage calculation
  const levelFactor = ((2 * level) / 5 + 2);
  const baseDamage = Math.floor(
    Math.floor(
      Math.floor(levelFactor * move.power * attack / defense) / 50
    ) + 2
  );

  // STAB (Same Type Attack Bonus) - 1.5x if move type matches Pokemon type
  const isSTAB = attacker.types.includes(move.type);
  const stabModifier = isSTAB ? 1.5 : 1;

  // Type effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.types);

  // Critical hit - 1.5x in modern gens
  const criticalModifier = isCritical ? 1.5 : 1;

  // Random factor - between 0.85 and 1.0
  const minRandom = 0.85;
  const maxRandom = 1.0;

  // Calculate final damage
  const modifier = stabModifier * effectiveness * criticalModifier;
  const avgDamage = Math.floor(baseDamage * modifier);
  const minDamage = Math.floor(baseDamage * modifier * minRandom);
  const maxDamage = Math.floor(baseDamage * modifier * maxRandom);

  // Calculate damage percentage
  const damagePercent = (avgDamage / defender.stats.hp) * 100;

  return {
    damage: avgDamage,
    minDamage,
    maxDamage,
    effectiveness,
    isCritical,
    isSTAB,
    damagePercent,
  };
}

/**
 * Get type effectiveness multiplier
 */
export function getTypeEffectiveness(
  attackType: PokemonType,
  defenderTypes: PokemonType[]
): number {
  let effectiveness = 1;

  for (const defenderType of defenderTypes) {
    effectiveness *= typeChart[attackType][defenderType];
  }

  return effectiveness;
}

/**
 * Get effectiveness description
 */
export function getEffectivenessText(effectiveness: number): string {
  if (effectiveness === 0) return 'No Effect';
  if (effectiveness < 0.5) return 'Not Very Effective (0.25x)';
  if (effectiveness < 1) return 'Not Very Effective (0.5x)';
  if (effectiveness === 1) return 'Normal';
  if (effectiveness === 2) return 'Super Effective (2x)';
  if (effectiveness >= 4) return 'Super Effective (4x)';
  return 'Normal';
}

/**
 * Determine if a hit is critical (simplified - 6.25% chance normally)
 */
export function rollCritical(): boolean {
  return Math.random() < 0.0625;
}

/**
 * Determine if move hits based on accuracy
 */
export function rollAccuracy(moveAccuracy: number): boolean {
  return Math.random() * 100 < moveAccuracy;
}

/**
 * Get best move for attacker against defender
 */
export function getBestMove(
  attacker: Pokemon,
  defender: Pokemon,
  availableMoves: Move[]
): Move {
  let bestMove = availableMoves[0];
  let bestDamage = 0;

  for (const move of availableMoves) {
    const calc = calculateDamage(attacker, defender, move);
    if (calc.damage > bestDamage) {
      bestDamage = calc.damage;
      bestMove = move;
    }
  }

  return bestMove;
}
