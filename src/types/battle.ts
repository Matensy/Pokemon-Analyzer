import { Pokemon, Move, PokemonType } from './pokemon';
import { WeatherType } from '../data/weather';

// Battle Types and Interfaces

export type BattleFormat = '1v1' | 'vgc' | 'doubles';
export type TerrainType = 'electric' | 'grassy' | 'misty' | 'psychic' | null;

// Field Hazards state for each side
export interface FieldHazards {
  stealthRock: boolean;
  spikesLayers: number; // 0-3
  toxicSpikesLayers: number; // 0-2
  stickyWeb: boolean;
}

// Field-wide effects
export interface FieldState {
  weather: WeatherType;
  weatherTurns: number;
  terrain: TerrainType;
  terrainTurns: number;
  // Screens and other side effects
  playerSide: SideConditions;
  aiSide: SideConditions;
}

export interface SideConditions {
  hazards: FieldHazards;
  reflect: number; // Turns remaining
  lightScreen: number;
  auroraVeil: number;
  tailwind: number;
  trickRoom: number; // Global but tracked here for simplicity
}

export interface BattleItem {
  id: string;
  name: string;
  category: 'healing' | 'status' | 'stat-boost' | 'berry' | 'held';
  effect: string;
  power?: number;
  description: string;
  canUseInBattle: boolean;
  // Held item specific properties
  statBoost?: {
    attackMult?: number;
    defenseMult?: number;
    spAtkMult?: number;
    spDefMult?: number;
    speedMult?: number;
  };
  locksMove?: boolean;
  endOfTurnHeal?: number;
  blocksStatusMoves?: boolean;
  requiresEvolution?: boolean;
  poisonTypeOnly?: boolean;
  superEffectiveBoost?: number;
  critBoost?: boolean;
  evasionBoost?: number;
  drainPercent?: number;
  groundImmune?: boolean;
}

export interface StatusCondition {
  name: 'burn' | 'freeze' | 'paralysis' | 'poison' | 'badly-poison' | 'sleep' | 'confusion' | null;
  turnsRemaining?: number;
}

// Mega Evolution, Dynamax, and Terastallization states
export interface MegaState {
  isMega: boolean;
  originalStats?: Pokemon['stats'];
}

export interface DynamaxState {
  isDynamaxed: boolean;
  turnsRemaining: number;
  originalMoves?: Move[];
  originalHp?: number;
}

export interface TeraState {
  isTerastallized: boolean;
  teraType: PokemonType | null;
  originalTypes?: PokemonType[];
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
  // Ability system
  activeAbility: string;
  abilityActivated: boolean; // For one-time abilities like Flash Fire boost
  // New mechanics
  megaState: MegaState;
  dynamaxState: DynamaxState;
  teraState: TeraState;
  canMegaEvolve: boolean;
  // VGC specific
  isGrounded: boolean; // For terrain/hazard effects
  hasSubstitute: boolean;
  substituteHp: number;
  protectCount: number; // For diminishing protect success
  lastMoveUsed?: Move;
  // Position in doubles (0 = left, 1 = right)
  position: number;
}

export interface BattleTeam {
  pokemon: BattlePokemon[];
  selectedForBattle: BattlePokemon[]; // For VGC mode (4 out of 6)
  items: BattleItem[];
  remainingPokemon: number;
  // Mechanic usage tracking
  hasMegaEvolved: boolean;
  hasDynamaxed: boolean;
  hasTerastallized: boolean;
}

export interface BattleAction {
  type: 'move' | 'switch' | 'item';
  pokemonIndex: number; // Which of your active Pokemon (0 or 1 in doubles)
  moveIndex?: number;
  targetIndex?: number; // Target position (0-3: 0,1 player, 2,3 opponent in doubles)
  switchToIndex?: number;
  itemId?: string;
  // Mechanic flags
  useMega?: boolean;
  useDynamax?: boolean;
  useTera?: boolean;
  teraType?: PokemonType;
  // Doubles specific
  targetAlly?: boolean; // For moves like Helping Hand
  spreadMove?: boolean; // For spread moves like Earthquake
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
  // Field state
  field: FieldState;
  isPlayerTurn: boolean;
  battleEnded: boolean;
  winner?: 'player' | 'ai' | 'draw';
  format: BattleFormat;
  // VGC Doubles specific
  isDoubles: boolean;
  // Audio settings
  musicEnabled: boolean;
  sfxEnabled: boolean;
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

// ELO/Ranking System
export interface PlayerRating {
  id: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
  rank: RankTier;
  matchHistory: MatchRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export type RankTier =
  | 'Poke Ball'
  | 'Great Ball'
  | 'Ultra Ball'
  | 'Master Ball'
  | 'Champion'
  | 'Elite'
  | 'Legend';

export interface MatchRecord {
  id: string;
  date: Date;
  playerTeam: string[]; // Pokemon names
  opponentTeam: string[];
  result: 'win' | 'loss' | 'draw';
  eloChange: number;
  turnsPlayed: number;
  mvp?: string; // Pokemon that dealt most damage
  format: BattleFormat;
}

// Damage calculation extended result
export interface ExtendedDamageCalc {
  damage: number;
  minDamage: number;
  maxDamage: number;
  effectiveness: number;
  isCritical: boolean;
  description: string;
  // Breakdown
  basePower: number;
  stab: boolean;
  weatherBoost: number;
  terrainBoost: number;
  abilityModifier: number;
  itemModifier: number;
  burnPenalty: boolean;
  screenReduction: boolean;
  koChance: number; // 0-100%
}

// Mega Evolution Data
export const MEGA_POKEMON: Record<string, { statBoost: Partial<Pokemon['stats']>, ability?: string }> = {
  'charizard': { statBoost: { attack: 46, specialAttack: 59, speed: 20 } },
  'blastoise': { statBoost: { specialAttack: 55, defense: 20, specialDefense: 20 } },
  'venusaur': { statBoost: { specialAttack: 32, defense: 20, specialDefense: 20 } },
  'alakazam': { statBoost: { specialAttack: 40, speed: 30, defense: 20 } },
  'gengar': { statBoost: { specialAttack: 40, speed: 20, defense: 20 } },
  'kangaskhan': { statBoost: { attack: 30, defense: 20, speed: 20 } },
  'pinsir': { statBoost: { attack: 30, speed: 55, defense: 10 } },
  'gyarados': { statBoost: { attack: 40, defense: 30, specialDefense: 30 } },
  'aerodactyl': { statBoost: { attack: 35, defense: 20, speed: 45 } },
  'mewtwo': { statBoost: { specialAttack: 74, speed: 40 } },
  'ampharos': { statBoost: { specialAttack: 60, defense: 20, specialDefense: 10 } },
  'scizor': { statBoost: { attack: 40, defense: 30, specialDefense: 20 } },
  'heracross': { statBoost: { attack: 50, defense: 30, specialDefense: 30 } },
  'tyranitar': { statBoost: { attack: 40, defense: 30, specialDefense: 30 } },
  'blaziken': { statBoost: { attack: 40, specialAttack: 20, speed: 40 } },
  'gardevoir': { statBoost: { specialAttack: 45, specialDefense: 30, speed: 20 } },
  'mawile': { statBoost: { attack: 60, defense: 40, specialDefense: 40 } },
  'aggron': { statBoost: { defense: 70, attack: 30 } },
  'medicham': { statBoost: { attack: 40, speed: 30, defense: 20 } },
  'manectric': { statBoost: { specialAttack: 40, speed: 45, defense: 15 } },
  'banette': { statBoost: { attack: 55, speed: 35, defense: 10 } },
  'absol': { statBoost: { attack: 40, speed: 45, defense: 15 } },
  'salamence': { statBoost: { attack: 20, defense: 50, speed: 30 } },
  'metagross': { statBoost: { attack: 40, defense: 20, speed: 40 } },
  'latias': { statBoost: { specialDefense: 40, defense: 40, speed: 20 } },
  'latios': { statBoost: { specialAttack: 40, speed: 40, defense: 20 } },
  'rayquaza': { statBoost: { attack: 50, specialAttack: 50 } },
  'garchomp': { statBoost: { attack: 40, speed: -10, defense: 40, specialDefense: 30 } },
  'lucario': { statBoost: { attack: 35, specialAttack: 35, speed: 30 } },
  'abomasnow': { statBoost: { attack: 30, specialAttack: 30, defense: 20, specialDefense: 20 } },
  'gallade': { statBoost: { attack: 45, defense: 20, speed: 35 } },
  'audino': { statBoost: { defense: 60, specialDefense: 60 } },
  'diancie': { statBoost: { attack: 60, specialAttack: 60, speed: 40 } },
};

// Dynamax Moves transformation
export const getDynamaxMove = (move: Move, pokemonTypes: PokemonType[]): Move => {
  const isStab = pokemonTypes.includes(move.type);
  const basePower = move.power || 0;

  // Calculate Max Move power
  let maxPower = 90;
  if (basePower >= 150) maxPower = 150;
  else if (basePower >= 130) maxPower = 140;
  else if (basePower >= 110) maxPower = 130;
  else if (basePower >= 90) maxPower = 120;
  else if (basePower >= 75) maxPower = 110;
  else if (basePower >= 55) maxPower = 100;
  else if (basePower >= 45) maxPower = 90;

  const maxMoveNames: Record<PokemonType, string> = {
    'normal': 'Max Strike',
    'fire': 'Max Flare',
    'water': 'Max Geyser',
    'electric': 'Max Lightning',
    'grass': 'Max Overgrowth',
    'ice': 'Max Hailstorm',
    'fighting': 'Max Knuckle',
    'poison': 'Max Ooze',
    'ground': 'Max Quake',
    'flying': 'Max Airstream',
    'psychic': 'Max Mindstorm',
    'bug': 'Max Flutterby',
    'rock': 'Max Rockfall',
    'ghost': 'Max Phantasm',
    'dragon': 'Max Wyrmwind',
    'dark': 'Max Darkness',
    'steel': 'Max Steelspike',
    'fairy': 'Max Starfall'
  };

  return {
    ...move,
    name: maxMoveNames[move.type] || 'Max Strike',
    power: maxPower,
    accuracy: null, // Max moves never miss
    description: `A powerful ${move.type}-type Max Move${isStab ? ' with STAB' : ''}`
  };
};
