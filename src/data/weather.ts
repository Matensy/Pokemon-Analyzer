// Weather System for VGC Battles
import { PokemonType } from '../types/pokemon';

export type WeatherType = 'sun' | 'rain' | 'sandstorm' | 'hail' | 'snow' | null;

export interface WeatherEffect {
  id: WeatherType;
  name: string;
  description: string;
  duration: number; // Turns (5 normally, 8 with rock/item)
  // Type damage modifiers
  boostsType?: PokemonType;
  boostMultiplier?: number;
  weakensType?: PokemonType;
  weakenMultiplier?: number;
  // End of turn damage
  damagePercent?: number;
  damageImmune?: PokemonType[]; // Types immune to weather damage
  // Other effects
  speedBoostAbilities?: string[]; // Abilities that double speed
  healAbilities?: string[]; // Abilities that heal in this weather
  activatesAbility?: string[]; // Abilities activated by this weather
  // Special effects
  chargesMove?: string; // e.g., Solar Beam instant in sun
  preventsFreeze?: boolean;
  boostsDefense?: PokemonType; // Ice types +50% Def in snow
}

export const WEATHER_EFFECTS: Record<string, WeatherEffect> = {
  sun: {
    id: 'sun',
    name: 'Harsh Sunlight',
    description: 'The sunlight is harsh! Fire moves are powered up and Water moves are weakened.',
    duration: 5,
    boostsType: 'fire',
    boostMultiplier: 1.5,
    weakensType: 'water',
    weakenMultiplier: 0.5,
    speedBoostAbilities: ['chlorophyll'],
    healAbilities: ['solar-power', 'dry-skin'],
    activatesAbility: ['solar-power', 'leaf-guard', 'flower-gift', 'forecast'],
    chargesMove: 'solar-beam',
    preventsFreeze: true
  },
  rain: {
    id: 'rain',
    name: 'Rain',
    description: 'It is raining! Water moves are powered up and Fire moves are weakened.',
    duration: 5,
    boostsType: 'water',
    boostMultiplier: 1.5,
    weakensType: 'fire',
    weakenMultiplier: 0.5,
    speedBoostAbilities: ['swift-swim'],
    healAbilities: ['rain-dish', 'dry-skin', 'hydration'],
    activatesAbility: ['rain-dish', 'hydration', 'forecast'],
    chargesMove: 'thunder' // Thunder never misses in rain
  },
  sandstorm: {
    id: 'sandstorm',
    name: 'Sandstorm',
    description: 'A sandstorm is raging! Non-Rock/Ground/Steel types take damage.',
    duration: 5,
    damagePercent: 6.25, // 1/16 max HP
    damageImmune: ['rock', 'ground', 'steel'],
    speedBoostAbilities: ['sand-rush'],
    activatesAbility: ['sand-force', 'sand-veil'],
    boostsDefense: 'rock' // Rock types get +50% SpDef
  },
  hail: {
    id: 'hail',
    name: 'Hail',
    description: 'It is hailing! Non-Ice types take damage.',
    duration: 5,
    damagePercent: 6.25,
    damageImmune: ['ice'],
    speedBoostAbilities: ['slush-rush'],
    healAbilities: ['ice-body'],
    activatesAbility: ['ice-body', 'snow-cloak']
  },
  snow: {
    id: 'snow',
    name: 'Snow',
    description: 'It is snowing! Ice-type Pokemon have boosted Defense.',
    duration: 5,
    speedBoostAbilities: ['slush-rush'],
    healAbilities: ['ice-body'],
    activatesAbility: ['ice-body', 'snow-cloak'],
    boostsDefense: 'ice' // Ice types get +50% Def in snow
  }
};

export interface FieldHazard {
  id: string;
  name: string;
  description: string;
  maxLayers: number;
  // Effects per layer
  damagePercent?: number[];
  effectType?: 'damage' | 'status' | 'stat';
  statusEffect?: string;
  statEffect?: { stat: string; stages: number };
  // Type interactions
  typeEffectiveness?: Record<PokemonType, number>; // For Stealth Rock
  immuneTypes?: PokemonType[]; // Types immune to the hazard
  removedByTypes?: PokemonType[]; // Types that remove hazard on switch-in (Toxic Spikes by Poison)
  // Blocked by
  blockedByItem?: string; // Heavy-Duty Boots
  blockedByAbility?: string[]; // Magic Guard
  affectsFlying?: boolean; // Default false for ground-based hazards
}

export const FIELD_HAZARDS: Record<string, FieldHazard> = {
  'stealth-rock': {
    id: 'stealth-rock',
    name: 'Stealth Rock',
    description: 'Pointed stones float around the opposing team, damaging Pokemon that switch in.',
    maxLayers: 1,
    effectType: 'damage',
    typeEffectiveness: {
      normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2,
      fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1,
      bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1
    },
    blockedByItem: 'heavy-duty-boots',
    blockedByAbility: ['magic-guard'],
    affectsFlying: true
  },
  'spikes': {
    id: 'spikes',
    name: 'Spikes',
    description: 'Spikes are scattered on the ground, damaging grounded Pokemon that switch in.',
    maxLayers: 3,
    damagePercent: [12.5, 16.67, 25], // 1/8, 1/6, 1/4 based on layers
    effectType: 'damage',
    immuneTypes: ['flying'],
    blockedByItem: 'heavy-duty-boots',
    blockedByAbility: ['magic-guard', 'levitate'],
    affectsFlying: false
  },
  'toxic-spikes': {
    id: 'toxic-spikes',
    name: 'Toxic Spikes',
    description: 'Toxic spikes poison grounded Pokemon that switch in.',
    maxLayers: 2,
    effectType: 'status',
    statusEffect: 'poison', // 1 layer = poison, 2 layers = badly-poison
    immuneTypes: ['flying', 'poison', 'steel'],
    removedByTypes: ['poison'],
    blockedByItem: 'heavy-duty-boots',
    blockedByAbility: ['magic-guard', 'levitate', 'immunity'],
    affectsFlying: false
  },
  'sticky-web': {
    id: 'sticky-web',
    name: 'Sticky Web',
    description: 'A sticky web lowers the Speed of grounded Pokemon that switch in.',
    maxLayers: 1,
    effectType: 'stat',
    statEffect: { stat: 'speed', stages: -1 },
    immuneTypes: ['flying'],
    blockedByItem: 'heavy-duty-boots',
    blockedByAbility: ['magic-guard', 'levitate', 'clear-body', 'white-smoke'],
    affectsFlying: false
  }
};

export interface Terrain {
  id: string;
  name: string;
  description: string;
  duration: number;
  // Effects
  boostsType?: PokemonType;
  boostMultiplier?: number;
  weakensType?: PokemonType;
  weakenMultiplier?: number;
  preventsStatus?: string[];
  healPercent?: number; // End of turn healing for grounded
  // Only affects grounded Pokemon
  affectsGrounded: boolean;
}

export const TERRAINS: Record<string, Terrain> = {
  electric: {
    id: 'electric',
    name: 'Electric Terrain',
    description: 'Electric Terrain powers up Electric moves and prevents sleep for grounded Pokemon.',
    duration: 5,
    boostsType: 'electric',
    boostMultiplier: 1.3,
    preventsStatus: ['sleep'],
    affectsGrounded: true
  },
  grassy: {
    id: 'grassy',
    name: 'Grassy Terrain',
    description: 'Grassy Terrain powers up Grass moves and heals grounded Pokemon each turn.',
    duration: 5,
    boostsType: 'grass',
    boostMultiplier: 1.3,
    healPercent: 6.25,
    affectsGrounded: true
  },
  psychic: {
    id: 'psychic',
    name: 'Psychic Terrain',
    description: 'Psychic Terrain powers up Psychic moves and blocks priority moves against grounded Pokemon.',
    duration: 5,
    boostsType: 'psychic',
    boostMultiplier: 1.3,
    affectsGrounded: true
  },
  misty: {
    id: 'misty',
    name: 'Misty Terrain',
    description: 'Misty Terrain weakens Dragon moves and prevents status for grounded Pokemon.',
    duration: 5,
    weakensType: 'dragon',
    weakenMultiplier: 0.5,
    preventsStatus: ['burn', 'freeze', 'paralysis', 'poison', 'badly-poison', 'sleep', 'confusion'],
    affectsGrounded: true
  }
};

export function getWeatherDamageMultiplier(weather: WeatherType, moveType: PokemonType): number {
  if (!weather) return 1;

  const effect = WEATHER_EFFECTS[weather];
  if (!effect) return 1;

  if (effect.boostsType === moveType) return effect.boostMultiplier || 1;
  if (effect.weakensType === moveType) return effect.weakenMultiplier || 1;

  return 1;
}

export function isImmuneToWeatherDamage(weather: WeatherType, pokemonTypes: PokemonType[]): boolean {
  if (!weather) return true;

  const effect = WEATHER_EFFECTS[weather];
  if (!effect || !effect.damageImmune) return true;

  return pokemonTypes.some(t => effect.damageImmune?.includes(t));
}

export function getTerrainBoost(terrain: string | null, moveType: PokemonType, isGrounded: boolean): number {
  if (!terrain || !isGrounded) return 1;

  const effect = TERRAINS[terrain];
  if (!effect) return 1;

  if (effect.boostsType === moveType) return effect.boostMultiplier || 1;
  if (effect.weakensType === moveType) return effect.weakenMultiplier || 1;

  return 1;
}
