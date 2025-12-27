// Pokemon Abilities System - VGC Battle Effects
import { PokemonType } from '../types/pokemon';

export interface AbilityEffect {
  id: string;
  name: string;
  description: string;
  // Trigger conditions
  trigger: 'on_switch_in' | 'on_damage_taken' | 'on_damage_dealt' | 'on_turn_end' | 'on_turn_start' | 'passive' | 'on_move_use' | 'on_status';
  // Effect types
  effectType: 'weather' | 'terrain' | 'stat_boost' | 'stat_drop' | 'damage_modifier' | 'type_immunity' | 'status_immunity' | 'heal' | 'ability_nullify' | 'priority_modifier' | 'contact_effect' | 'move_modifier';
  // Effect details
  weather?: 'sun' | 'rain' | 'sandstorm' | 'hail' | 'snow';
  terrain?: 'electric' | 'grassy' | 'misty' | 'psychic';
  statBoost?: { stat: string; stages: number };
  damageMultiplier?: number;
  immuneToType?: PokemonType;
  immuneToStatus?: string[];
  healPercent?: number;
  contactDamagePercent?: number;
  priorityBoost?: number;
  affectsOpponent?: boolean;
  affectsAllies?: boolean;
  conditionType?: PokemonType; // For type-conditional abilities
  conditionCategory?: 'physical' | 'special';
  conditionHpThreshold?: number; // e.g., 0.5 for 50% HP
  conditionWeather?: string;
}

export const ABILITIES: Record<string, AbilityEffect> = {
  // Weather Setters
  'drought': {
    id: 'drought',
    name: 'Drought',
    description: 'Summons harsh sunlight when entering battle.',
    trigger: 'on_switch_in',
    effectType: 'weather',
    weather: 'sun'
  },
  'drizzle': {
    id: 'drizzle',
    name: 'Drizzle',
    description: 'Summons rain when entering battle.',
    trigger: 'on_switch_in',
    effectType: 'weather',
    weather: 'rain'
  },
  'sand-stream': {
    id: 'sand-stream',
    name: 'Sand Stream',
    description: 'Summons a sandstorm when entering battle.',
    trigger: 'on_switch_in',
    effectType: 'weather',
    weather: 'sandstorm'
  },
  'snow-warning': {
    id: 'snow-warning',
    name: 'Snow Warning',
    description: 'Summons snow when entering battle.',
    trigger: 'on_switch_in',
    effectType: 'weather',
    weather: 'snow'
  },

  // Type Immunities
  'levitate': {
    id: 'levitate',
    name: 'Levitate',
    description: 'Gives immunity to Ground-type moves.',
    trigger: 'passive',
    effectType: 'type_immunity',
    immuneToType: 'ground'
  },
  'water-absorb': {
    id: 'water-absorb',
    name: 'Water Absorb',
    description: 'Restores HP when hit by Water-type moves.',
    trigger: 'on_damage_taken',
    effectType: 'heal',
    immuneToType: 'water',
    healPercent: 25
  },
  'volt-absorb': {
    id: 'volt-absorb',
    name: 'Volt Absorb',
    description: 'Restores HP when hit by Electric-type moves.',
    trigger: 'on_damage_taken',
    effectType: 'heal',
    immuneToType: 'electric',
    healPercent: 25
  },
  'flash-fire': {
    id: 'flash-fire',
    name: 'Flash Fire',
    description: 'Powers up Fire-type moves when hit by one.',
    trigger: 'on_damage_taken',
    effectType: 'type_immunity',
    immuneToType: 'fire'
  },
  'lightning-rod': {
    id: 'lightning-rod',
    name: 'Lightning Rod',
    description: 'Draws in Electric-type moves and boosts Sp. Atk.',
    trigger: 'on_damage_taken',
    effectType: 'stat_boost',
    immuneToType: 'electric',
    statBoost: { stat: 'specialAttack', stages: 1 }
  },
  'storm-drain': {
    id: 'storm-drain',
    name: 'Storm Drain',
    description: 'Draws in Water-type moves and boosts Sp. Atk.',
    trigger: 'on_damage_taken',
    effectType: 'stat_boost',
    immuneToType: 'water',
    statBoost: { stat: 'specialAttack', stages: 1 }
  },
  'motor-drive': {
    id: 'motor-drive',
    name: 'Motor Drive',
    description: 'Boosts Speed when hit by Electric-type moves.',
    trigger: 'on_damage_taken',
    effectType: 'stat_boost',
    immuneToType: 'electric',
    statBoost: { stat: 'speed', stages: 1 }
  },
  'sap-sipper': {
    id: 'sap-sipper',
    name: 'Sap Sipper',
    description: 'Boosts Attack when hit by Grass-type moves.',
    trigger: 'on_damage_taken',
    effectType: 'stat_boost',
    immuneToType: 'grass',
    statBoost: { stat: 'attack', stages: 1 }
  },

  // Stat Boosters on Switch-In
  'intimidate': {
    id: 'intimidate',
    name: 'Intimidate',
    description: 'Lowers the Attack of opposing Pokemon.',
    trigger: 'on_switch_in',
    effectType: 'stat_drop',
    statBoost: { stat: 'attack', stages: -1 },
    affectsOpponent: true
  },
  'download': {
    id: 'download',
    name: 'Download',
    description: 'Boosts Attack or Sp. Atk based on foe\'s lower stat.',
    trigger: 'on_switch_in',
    effectType: 'stat_boost',
    statBoost: { stat: 'attack', stages: 1 } // Logic handled in engine
  },
  'beast-boost': {
    id: 'beast-boost',
    name: 'Beast Boost',
    description: 'Boosts highest stat when KOing a Pokemon.',
    trigger: 'on_damage_dealt',
    effectType: 'stat_boost',
    statBoost: { stat: 'attack', stages: 1 }
  },
  'speed-boost': {
    id: 'speed-boost',
    name: 'Speed Boost',
    description: 'Boosts Speed at the end of each turn.',
    trigger: 'on_turn_end',
    effectType: 'stat_boost',
    statBoost: { stat: 'speed', stages: 1 }
  },
  'moxie': {
    id: 'moxie',
    name: 'Moxie',
    description: 'Boosts Attack after knocking out a Pokemon.',
    trigger: 'on_damage_dealt',
    effectType: 'stat_boost',
    statBoost: { stat: 'attack', stages: 1 }
  },

  // Damage Modifiers
  'huge-power': {
    id: 'huge-power',
    name: 'Huge Power',
    description: 'Doubles the Pokemon\'s Attack stat.',
    trigger: 'passive',
    effectType: 'damage_modifier',
    damageMultiplier: 2.0,
    conditionCategory: 'physical'
  },
  'pure-power': {
    id: 'pure-power',
    name: 'Pure Power',
    description: 'Doubles the Pokemon\'s Attack stat.',
    trigger: 'passive',
    effectType: 'damage_modifier',
    damageMultiplier: 2.0,
    conditionCategory: 'physical'
  },
  'hustle': {
    id: 'hustle',
    name: 'Hustle',
    description: 'Boosts Attack by 50% but lowers accuracy of physical moves.',
    trigger: 'passive',
    effectType: 'damage_modifier',
    damageMultiplier: 1.5,
    conditionCategory: 'physical'
  },
  'guts': {
    id: 'guts',
    name: 'Guts',
    description: 'Boosts Attack when affected by a status condition.',
    trigger: 'passive',
    effectType: 'damage_modifier',
    damageMultiplier: 1.5,
    conditionCategory: 'physical'
  },
  'technician': {
    id: 'technician',
    name: 'Technician',
    description: 'Powers up moves with 60 or less base power.',
    trigger: 'on_move_use',
    effectType: 'damage_modifier',
    damageMultiplier: 1.5
  },
  'adaptability': {
    id: 'adaptability',
    name: 'Adaptability',
    description: 'Increases STAB bonus from 1.5x to 2x.',
    trigger: 'passive',
    effectType: 'damage_modifier',
    damageMultiplier: 2.0 // For STAB moves
  },
  'tough-claws': {
    id: 'tough-claws',
    name: 'Tough Claws',
    description: 'Powers up contact moves by 30%.',
    trigger: 'on_move_use',
    effectType: 'damage_modifier',
    damageMultiplier: 1.3
  },
  'sheer-force': {
    id: 'sheer-force',
    name: 'Sheer Force',
    description: 'Removes secondary effects but boosts move power by 30%.',
    trigger: 'on_move_use',
    effectType: 'damage_modifier',
    damageMultiplier: 1.3
  },
  'solar-power': {
    id: 'solar-power',
    name: 'Solar Power',
    description: 'Boosts Sp. Atk in harsh sunlight but takes damage.',
    trigger: 'passive',
    effectType: 'damage_modifier',
    damageMultiplier: 1.5,
    conditionWeather: 'sun',
    conditionCategory: 'special'
  },
  'sand-force': {
    id: 'sand-force',
    name: 'Sand Force',
    description: 'Boosts Rock, Ground, and Steel moves in sandstorm.',
    trigger: 'passive',
    effectType: 'damage_modifier',
    damageMultiplier: 1.3,
    conditionWeather: 'sandstorm'
  },

  // Defensive Abilities
  'multiscale': {
    id: 'multiscale',
    name: 'Multiscale',
    description: 'Halves damage taken when at full HP.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.5,
    conditionHpThreshold: 1.0
  },
  'shadow-shield': {
    id: 'shadow-shield',
    name: 'Shadow Shield',
    description: 'Halves damage taken when at full HP.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.5,
    conditionHpThreshold: 1.0
  },
  'fur-coat': {
    id: 'fur-coat',
    name: 'Fur Coat',
    description: 'Halves physical damage taken.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.5,
    conditionCategory: 'physical'
  },
  'thick-fat': {
    id: 'thick-fat',
    name: 'Thick Fat',
    description: 'Halves damage from Fire and Ice-type moves.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.5
  },
  'filter': {
    id: 'filter',
    name: 'Filter',
    description: 'Reduces super effective damage by 25%.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.75
  },
  'solid-rock': {
    id: 'solid-rock',
    name: 'Solid Rock',
    description: 'Reduces super effective damage by 25%.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.75
  },
  'prism-armor': {
    id: 'prism-armor',
    name: 'Prism Armor',
    description: 'Reduces super effective damage by 25%.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.75
  },
  'ice-scales': {
    id: 'ice-scales',
    name: 'Ice Scales',
    description: 'Halves special damage taken.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    damageMultiplier: 0.5,
    conditionCategory: 'special'
  },

  // Contact Effects
  'rough-skin': {
    id: 'rough-skin',
    name: 'Rough Skin',
    description: 'Damages attackers that make contact.',
    trigger: 'on_damage_taken',
    effectType: 'contact_effect',
    contactDamagePercent: 12.5
  },
  'iron-barbs': {
    id: 'iron-barbs',
    name: 'Iron Barbs',
    description: 'Damages attackers that make contact.',
    trigger: 'on_damage_taken',
    effectType: 'contact_effect',
    contactDamagePercent: 12.5
  },
  'flame-body': {
    id: 'flame-body',
    name: 'Flame Body',
    description: '30% chance to burn attackers on contact.',
    trigger: 'on_damage_taken',
    effectType: 'contact_effect'
  },
  'static': {
    id: 'static',
    name: 'Static',
    description: '30% chance to paralyze attackers on contact.',
    trigger: 'on_damage_taken',
    effectType: 'contact_effect'
  },
  'poison-point': {
    id: 'poison-point',
    name: 'Poison Point',
    description: '30% chance to poison attackers on contact.',
    trigger: 'on_damage_taken',
    effectType: 'contact_effect'
  },

  // Status Immunities
  'immunity': {
    id: 'immunity',
    name: 'Immunity',
    description: 'Prevents poisoning.',
    trigger: 'passive',
    effectType: 'status_immunity',
    immuneToStatus: ['poison', 'badly-poison']
  },
  'limber': {
    id: 'limber',
    name: 'Limber',
    description: 'Prevents paralysis.',
    trigger: 'passive',
    effectType: 'status_immunity',
    immuneToStatus: ['paralysis']
  },
  'insomnia': {
    id: 'insomnia',
    name: 'Insomnia',
    description: 'Prevents sleep.',
    trigger: 'passive',
    effectType: 'status_immunity',
    immuneToStatus: ['sleep']
  },
  'vital-spirit': {
    id: 'vital-spirit',
    name: 'Vital Spirit',
    description: 'Prevents sleep.',
    trigger: 'passive',
    effectType: 'status_immunity',
    immuneToStatus: ['sleep']
  },
  'own-tempo': {
    id: 'own-tempo',
    name: 'Own Tempo',
    description: 'Prevents confusion.',
    trigger: 'passive',
    effectType: 'status_immunity',
    immuneToStatus: ['confusion']
  },
  'oblivious': {
    id: 'oblivious',
    name: 'Oblivious',
    description: 'Prevents infatuation and Taunt.',
    trigger: 'passive',
    effectType: 'status_immunity',
    immuneToStatus: ['infatuation']
  },
  'magic-bounce': {
    id: 'magic-bounce',
    name: 'Magic Bounce',
    description: 'Reflects status moves back at the user.',
    trigger: 'on_status',
    effectType: 'status_immunity'
  },

  // Weather-based Abilities
  'chlorophyll': {
    id: 'chlorophyll',
    name: 'Chlorophyll',
    description: 'Doubles Speed in harsh sunlight.',
    trigger: 'passive',
    effectType: 'stat_boost',
    statBoost: { stat: 'speed', stages: 0 }, // Handled as 2x multiplier
    conditionWeather: 'sun'
  },
  'swift-swim': {
    id: 'swift-swim',
    name: 'Swift Swim',
    description: 'Doubles Speed in rain.',
    trigger: 'passive',
    effectType: 'stat_boost',
    statBoost: { stat: 'speed', stages: 0 },
    conditionWeather: 'rain'
  },
  'sand-rush': {
    id: 'sand-rush',
    name: 'Sand Rush',
    description: 'Doubles Speed in sandstorm.',
    trigger: 'passive',
    effectType: 'stat_boost',
    statBoost: { stat: 'speed', stages: 0 },
    conditionWeather: 'sandstorm'
  },
  'slush-rush': {
    id: 'slush-rush',
    name: 'Slush Rush',
    description: 'Doubles Speed in snow.',
    trigger: 'passive',
    effectType: 'stat_boost',
    statBoost: { stat: 'speed', stages: 0 },
    conditionWeather: 'snow'
  },

  // Priority Modifiers
  'prankster': {
    id: 'prankster',
    name: 'Prankster',
    description: 'Gives priority +1 to status moves.',
    trigger: 'on_move_use',
    effectType: 'priority_modifier',
    priorityBoost: 1
  },
  'gale-wings': {
    id: 'gale-wings',
    name: 'Gale Wings',
    description: 'Gives priority +1 to Flying-type moves at full HP.',
    trigger: 'on_move_use',
    effectType: 'priority_modifier',
    priorityBoost: 1,
    conditionType: 'flying',
    conditionHpThreshold: 1.0
  },
  'triage': {
    id: 'triage',
    name: 'Triage',
    description: 'Gives priority +3 to healing moves.',
    trigger: 'on_move_use',
    effectType: 'priority_modifier',
    priorityBoost: 3
  },

  // Special Abilities
  'protean': {
    id: 'protean',
    name: 'Protean',
    description: 'Changes type to match the move being used.',
    trigger: 'on_move_use',
    effectType: 'move_modifier'
  },
  'libero': {
    id: 'libero',
    name: 'Libero',
    description: 'Changes type to match the move being used.',
    trigger: 'on_move_use',
    effectType: 'move_modifier'
  },
  'wonder-guard': {
    id: 'wonder-guard',
    name: 'Wonder Guard',
    description: 'Only super effective moves can deal damage.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier'
  },
  'disguise': {
    id: 'disguise',
    name: 'Disguise',
    description: 'Blocks one damaging move with its disguise.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier'
  },
  'sturdy': {
    id: 'sturdy',
    name: 'Sturdy',
    description: 'Cannot be KOed from full HP by a single hit.',
    trigger: 'on_damage_taken',
    effectType: 'damage_modifier',
    conditionHpThreshold: 1.0
  },

  // Healing Abilities
  'regenerator': {
    id: 'regenerator',
    name: 'Regenerator',
    description: 'Restores 1/3 max HP when switching out.',
    trigger: 'on_switch_in', // Actually on switch out
    effectType: 'heal',
    healPercent: 33
  },
  'poison-heal': {
    id: 'poison-heal',
    name: 'Poison Heal',
    description: 'Heals 1/8 max HP when poisoned instead of taking damage.',
    trigger: 'on_turn_end',
    effectType: 'heal',
    healPercent: 12.5
  },
  'rain-dish': {
    id: 'rain-dish',
    name: 'Rain Dish',
    description: 'Heals 1/16 max HP each turn in rain.',
    trigger: 'on_turn_end',
    effectType: 'heal',
    healPercent: 6.25,
    conditionWeather: 'rain'
  },
  'ice-body': {
    id: 'ice-body',
    name: 'Ice Body',
    description: 'Heals 1/16 max HP each turn in snow.',
    trigger: 'on_turn_end',
    effectType: 'heal',
    healPercent: 6.25,
    conditionWeather: 'snow'
  },

  // Ability Nullifiers
  'mold-breaker': {
    id: 'mold-breaker',
    name: 'Mold Breaker',
    description: 'Ignores defensive abilities.',
    trigger: 'on_move_use',
    effectType: 'ability_nullify'
  },
  'teravolt': {
    id: 'teravolt',
    name: 'Teravolt',
    description: 'Ignores defensive abilities.',
    trigger: 'on_move_use',
    effectType: 'ability_nullify'
  },
  'turboblaze': {
    id: 'turboblaze',
    name: 'Turboblaze',
    description: 'Ignores defensive abilities.',
    trigger: 'on_move_use',
    effectType: 'ability_nullify'
  },

  // Miscellaneous VGC-relevant
  'clear-body': {
    id: 'clear-body',
    name: 'Clear Body',
    description: 'Prevents stat reduction by opponents.',
    trigger: 'passive',
    effectType: 'stat_boost'
  },
  'white-smoke': {
    id: 'white-smoke',
    name: 'White Smoke',
    description: 'Prevents stat reduction by opponents.',
    trigger: 'passive',
    effectType: 'stat_boost'
  },
  'contrary': {
    id: 'contrary',
    name: 'Contrary',
    description: 'Stat changes are reversed.',
    trigger: 'passive',
    effectType: 'stat_boost'
  },
  'defiant': {
    id: 'defiant',
    name: 'Defiant',
    description: 'Boosts Attack by 2 when stats are lowered.',
    trigger: 'on_status',
    effectType: 'stat_boost',
    statBoost: { stat: 'attack', stages: 2 }
  },
  'competitive': {
    id: 'competitive',
    name: 'Competitive',
    description: 'Boosts Sp. Atk by 2 when stats are lowered.',
    trigger: 'on_status',
    effectType: 'stat_boost',
    statBoost: { stat: 'specialAttack', stages: 2 }
  },
  'inner-focus': {
    id: 'inner-focus',
    name: 'Inner Focus',
    description: 'Prevents flinching and Intimidate.',
    trigger: 'passive',
    effectType: 'status_immunity',
    immuneToStatus: ['flinch']
  },
  'pressure': {
    id: 'pressure',
    name: 'Pressure',
    description: 'Raises opposing Pokemon\'s PP usage.',
    trigger: 'passive',
    effectType: 'move_modifier'
  },
  'unaware': {
    id: 'unaware',
    name: 'Unaware',
    description: 'Ignores stat changes of opposing Pokemon.',
    trigger: 'passive',
    effectType: 'damage_modifier'
  }
};

export function getAbilityEffect(abilityName: string): AbilityEffect | null {
  const normalized = abilityName.toLowerCase().replace(/\s+/g, '-');
  return ABILITIES[normalized] || null;
}

export function hasAbility(abilities: { name: string }[], abilityName: string): boolean {
  const normalized = abilityName.toLowerCase().replace(/\s+/g, '-');
  return abilities.some(a => a.name.toLowerCase().replace(/\s+/g, '-') === normalized);
}
