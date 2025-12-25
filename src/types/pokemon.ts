// Pokemon Types and Interfaces

export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic'
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  description: string;
}

export interface Move {
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  description: string;
  learnMethod: 'level-up' | 'tm' | 'egg' | 'tutor';
  level?: number;
}

export interface Moveset {
  role: string;
  moves: string[];
  ability: string;
  item: string;
  nature: string;
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  description: string;
}

export interface TypeEffectiveness {
  immune: PokemonType[];
  weakTo: PokemonType[];
  resistantTo: PokemonType[];
  doubleWeakTo: PokemonType[];
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  stats: PokemonStats;
  abilities: PokemonAbility[];
  generation: Generation;
  sprite: string;
  spriteShiny: string;
  artwork: string;
  height: number;
  weight: number;
  moves: Move[];
  recommendedMovesets: Moveset[];
  typeEffectiveness: TypeEffectiveness;
}

export interface TeamAnalysis {
  overallScore: number;
  typecoverage: {
    offensive: Record<PokemonType, number>;
    defensive: Record<PokemonType, number>;
  };
  weaknesses: {
    type: PokemonType;
    count: number;
    affectedPokemon: string[];
  }[];
  strengths: PokemonType[];
  synergies: {
    pokemon1: string;
    pokemon2: string;
    description: string;
    score: number;
  }[];
  threats: {
    pokemon: string;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  recommendations: {
    type: 'swap' | 'add' | 'moveset' | 'warning';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }[];
}

export interface BattleSimulation {
  attacker: Pokemon;
  defender: Pokemon;
  move: Move;
  damage: {
    min: number;
    max: number;
    average: number;
  };
  effectiveness: number;
  isCritical: boolean;
  koChance: number;
}
