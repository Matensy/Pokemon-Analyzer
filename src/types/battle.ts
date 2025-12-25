import { Pokemon, Move, PokemonType } from './pokemon';

// Battle Types and Interfaces

export type BattleFormat = '1v1' | 'vgc' | 'doubles';

export interface BattleItem {
  id: string;
  name: string;
  category: 'healing' | 'status' | 'stat-boost' | 'berry' | 'held';
  effect: string;
  power?: number;
  description: string;
  canUseInBattle: boolean;
}

export interface StatusCondition {
  name: 'burn' | 'freeze' | 'paralysis' | 'poison' | 'badly-poison' | 'sleep' | 'confusion' | null;
  turnsRemaining?: number;
}

export interface BattlePokemon extends Pokemon {
  currentHp: number;
  maxHp: number;
  level: number;
  status: StatusCondition;
  statStages: {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    accuracy: number;
    evasion: number;
  };
  heldItem?: BattleItem;
  selectedMoves: Move[];
  isActive: boolean;
  isFainted: boolean;
}

export interface BattleTeam {
  pokemon: BattlePokemon[];
  selectedForBattle: BattlePokemon[]; // For VGC mode (4 out of 6)
  items: BattleItem[];
  remainingPokemon: number;
}

export interface BattleAction {
  type: 'move' | 'switch' | 'item';
  pokemonIndex: number;
  moveIndex?: number;
  targetIndex?: number;
  switchToIndex?: number;
  itemId?: string;
}

export interface BattleTurn {
  playerAction: BattleAction;
  aiAction: BattleAction;
  turnNumber: number;
  log: string[];
}

export interface DamageCalculation {
  damage: number;
  effectiveness: number;
  isCritical: boolean;
  description: string;
}

export interface BattleState {
  playerTeam: BattleTeam;
  aiTeam: BattleTeam;
  currentTurn: number;
  battleLog: string[];
  weather?: 'sun' | 'rain' | 'sandstorm' | 'hail' | null;
  terrain?: 'electric' | 'grassy' | 'misty' | 'psychic' | null;
  isPlayerTurn: boolean;
  battleEnded: boolean;
  winner?: 'player' | 'ai' | 'draw';
  format: BattleFormat;
}

export interface AIDecision {
  action: BattleAction;
  reasoning: string;
  priority: number;
}

export interface TeamSynergyScore {
  overall: number;
  offensiveCoverage: number;
  defensiveSynergy: number;
  speedTiers: number;
  roleBalance: number;
}
