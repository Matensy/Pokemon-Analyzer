// Smogon-style competitive movesets for various formats
// Data sourced from competitive usage statistics

export type SmogonFormat = 'vgc2025' | 'nationaldex' | 'ubers' | 'ou' | 'uu' | 'ru' | 'nu';

export interface SmogonMoveset {
  name: string;
  format: SmogonFormat;
  pokemon: string;
  ability: string;
  item: string;
  teraType?: string;
  nature: string;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs?: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
  moves: string[];
  usage: number; // percentage
  description: string;
}

export interface PokemonRole {
  name: string;
  description: string;
  examples: string[];
}

// Team Roles for VGC
export const VGC_ROLES: PokemonRole[] = [
  { name: 'Restricted', description: 'Legendary Pokemon (2 max per VGC team)', examples: ['Koraidon', 'Miraidon', 'Calyrex-Shadow', 'Calyrex-Ice'] },
  { name: 'Speed Control', description: 'Sets Tailwind, Trick Room, or Thunder Wave', examples: ['Tornadus', 'Whimsicott', 'Farigiraf', 'Indeedee-F'] },
  { name: 'Offensive Support', description: 'Provides Fake Out, redirection, or screens', examples: ['Rillaboom', 'Incineroar', 'Amoonguss', 'Grimmsnarl'] },
  { name: 'Physical Sweeper', description: 'High physical attack damage dealer', examples: ['Koraidon', 'Chien-Pao', 'Iron Hands', 'Ursaluna'] },
  { name: 'Special Sweeper', description: 'High special attack damage dealer', examples: ['Flutter Mane', 'Miraidon', 'Walking Wake', 'Gholdengo'] },
  { name: 'Tank/Bulky Attacker', description: 'Can take hits while dealing damage', examples: ['Incineroar', 'Archaludon', 'Iron Hands', 'Kingambit'] },
  { name: 'Defensive Pivot', description: 'Absorbs attacks and pivots out', examples: ['Amoonguss', 'Dondozo', 'Gastrodon', 'Cresselia'] },
  { name: 'Weather Setter', description: 'Sets Sun, Rain, Sand, or Snow', examples: ['Koraidon', 'Pelipper', 'Tyranitar', 'Abomasnow'] },
  { name: 'Terrain Setter', description: 'Sets Psychic, Electric, Grassy, or Misty Terrain', examples: ['Rillaboom', 'Pincurchin', 'Indeedee-F', 'Tapu Fini'] },
];

// Type coverage goals
export const TYPE_COVERAGE_GOALS = {
  offensive: ['Dragon', 'Fairy', 'Steel', 'Ground', 'Fire', 'Water'],
  defensive: ['Normal', 'Ghost', 'Fairy', 'Steel', 'Ground', 'Water']
};

// Top Pokemon movesets by format
export const SMOGON_MOVESETS: SmogonMoveset[] = [
  // ============ VGC 2025 REGULATION H ============
  // Koraidon
  {
    name: 'Standard Physical Attacker',
    format: 'vgc2025',
    pokemon: 'koraidon',
    ability: 'Orichalcum Pulse',
    item: 'Choice Scarf',
    teraType: 'Fire',
    nature: 'Jolly',
    evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    moves: ['Collision Course', 'Flare Blitz', 'U-turn', 'Dragon Claw'],
    usage: 42.5,
    description: 'Fast physical sweeper that abuses sun-boosted attacks.'
  },
  {
    name: 'Bulky Assault Vest',
    format: 'vgc2025',
    pokemon: 'koraidon',
    ability: 'Orichalcum Pulse',
    item: 'Assault Vest',
    teraType: 'Fairy',
    nature: 'Adamant',
    evs: { hp: 252, atk: 156, def: 4, spa: 0, spd: 92, spe: 4 },
    moves: ['Collision Course', 'Flare Blitz', 'Dragon Claw', 'Breaking Swipe'],
    usage: 28.3,
    description: 'Bulkier variant that can take special hits while dealing damage.'
  },
  // Miraidon
  {
    name: 'Choice Specs Sweeper',
    format: 'vgc2025',
    pokemon: 'miraidon',
    ability: 'Hadron Engine',
    item: 'Choice Specs',
    teraType: 'Fairy',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Electro Drift', 'Draco Meteor', 'Dazzling Gleam', 'Volt Switch'],
    usage: 38.7,
    description: 'Maximum damage output special attacker under Electric Terrain.'
  },
  {
    name: 'Life Orb All-Out Attacker',
    format: 'vgc2025',
    pokemon: 'miraidon',
    ability: 'Hadron Engine',
    item: 'Life Orb',
    teraType: 'Water',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Electro Drift', 'Draco Meteor', 'Overheat', 'Protect'],
    usage: 31.2,
    description: 'Flexible attacker with Protect for pivoting.'
  },
  // Calyrex-Shadow
  {
    name: 'Choice Specs Nuke',
    format: 'vgc2025',
    pokemon: 'calyrex-shadow',
    ability: 'As One',
    item: 'Choice Specs',
    teraType: 'Ghost',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Astral Barrage', 'Psyshock', 'Draining Kiss', 'Trick'],
    usage: 45.6,
    description: 'Devastating special attacker that deletes teams with Astral Barrage.'
  },
  {
    name: 'Focus Sash Lead',
    format: 'vgc2025',
    pokemon: 'calyrex-shadow',
    ability: 'As One',
    item: 'Focus Sash',
    teraType: 'Fairy',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Astral Barrage', 'Psyshock', 'Nasty Plot', 'Protect'],
    usage: 22.1,
    description: 'Setup sweeper that guarantees at least one boost.'
  },
  // Flutter Mane
  {
    name: 'Choice Specs Nuker',
    format: 'vgc2025',
    pokemon: 'flutter-mane',
    ability: 'Protosynthesis',
    item: 'Choice Specs',
    teraType: 'Fairy',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Moonblast', 'Shadow Ball', 'Dazzling Gleam', 'Mystical Fire'],
    usage: 52.3,
    description: 'Premier special attacker with incredible speed and power.'
  },
  {
    name: 'Booster Energy Speed',
    format: 'vgc2025',
    pokemon: 'flutter-mane',
    ability: 'Protosynthesis',
    item: 'Booster Energy',
    teraType: 'Stellar',
    nature: 'Modest',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Moonblast', 'Shadow Ball', 'Perish Song', 'Protect'],
    usage: 31.5,
    description: 'Utility variant with Perish Song for stall matchups.'
  },
  // Incineroar
  {
    name: 'Standard Support',
    format: 'vgc2025',
    pokemon: 'incineroar',
    ability: 'Intimidate',
    item: 'Safety Goggles',
    teraType: 'Ghost',
    nature: 'Careful',
    evs: { hp: 252, atk: 4, def: 52, spa: 0, spd: 196, spe: 4 },
    moves: ['Fake Out', 'Flare Blitz', 'Knock Off', 'Parting Shot'],
    usage: 67.8,
    description: 'The best support Pokemon in VGC. Fake Out + Intimidate cycle.'
  },
  {
    name: 'Assault Vest Tank',
    format: 'vgc2025',
    pokemon: 'incineroar',
    ability: 'Intimidate',
    item: 'Assault Vest',
    teraType: 'Water',
    nature: 'Adamant',
    evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
    moves: ['Fake Out', 'Flare Blitz', 'Knock Off', 'U-turn'],
    usage: 18.4,
    description: 'Bulkier variant that can tank more special hits.'
  },
  // Rillaboom
  {
    name: 'Assault Vest Pivot',
    format: 'vgc2025',
    pokemon: 'rillaboom',
    ability: 'Grassy Surge',
    item: 'Assault Vest',
    teraType: 'Fire',
    nature: 'Adamant',
    evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
    moves: ['Grassy Glide', 'Wood Hammer', 'Fake Out', 'U-turn'],
    usage: 58.2,
    description: 'Priority Grassy Glide in terrain. Excellent pivot.'
  },
  {
    name: 'Choice Band Wallbreaker',
    format: 'vgc2025',
    pokemon: 'rillaboom',
    ability: 'Grassy Surge',
    item: 'Choice Band',
    teraType: 'Normal',
    nature: 'Adamant',
    evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    moves: ['Grassy Glide', 'Wood Hammer', 'High Horsepower', 'U-turn'],
    usage: 23.6,
    description: 'Maximum damage output for breaking walls.'
  },
  // Amoonguss
  {
    name: 'Standard Redirector',
    format: 'vgc2025',
    pokemon: 'amoonguss',
    ability: 'Regenerator',
    item: 'Sitrus Berry',
    teraType: 'Water',
    nature: 'Sassy',
    evs: { hp: 252, atk: 0, def: 132, spa: 0, spd: 124, spe: 0 },
    ivs: { spe: 0 },
    moves: ['Spore', 'Rage Powder', 'Pollen Puff', 'Protect'],
    usage: 48.7,
    description: 'Premier support with redirection and Spore.'
  },
  {
    name: 'Coba Berry Anti-Flying',
    format: 'vgc2025',
    pokemon: 'amoonguss',
    ability: 'Regenerator',
    item: 'Coba Berry',
    teraType: 'Steel',
    nature: 'Relaxed',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    ivs: { spe: 0 },
    moves: ['Spore', 'Rage Powder', 'Clear Smog', 'Protect'],
    usage: 28.3,
    description: 'Survives Brave Birds and Flying moves.'
  },
  // Tornadus
  {
    name: 'Tailwind Support',
    format: 'vgc2025',
    pokemon: 'tornadus',
    ability: 'Prankster',
    item: 'Focus Sash',
    teraType: 'Ghost',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Tailwind', 'Bleakwind Storm', 'Taunt', 'Protect'],
    usage: 43.2,
    description: 'Priority Tailwind setter with excellent speed control.'
  },
  // Chien-Pao
  {
    name: 'Choice Band Nuke',
    format: 'vgc2025',
    pokemon: 'chien-pao',
    ability: 'Sword of Ruin',
    item: 'Choice Band',
    teraType: 'Ice',
    nature: 'Jolly',
    evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    moves: ['Icicle Crash', 'Crunch', 'Ice Shard', 'Sacred Sword'],
    usage: 45.1,
    description: 'Devastating physical attacker with priority Ice Shard.'
  },
  // Iron Hands
  {
    name: 'Assault Vest Tank',
    format: 'vgc2025',
    pokemon: 'iron-hands',
    ability: 'Quark Drive',
    item: 'Assault Vest',
    teraType: 'Grass',
    nature: 'Adamant',
    evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    moves: ['Drain Punch', 'Wild Charge', 'Fake Out', 'Heavy Slam'],
    usage: 51.8,
    description: 'Incredibly bulky with Fake Out support and self-healing.'
  },
  // Gholdengo
  {
    name: 'Choice Specs Wallbreaker',
    format: 'vgc2025',
    pokemon: 'gholdengo',
    ability: 'Good as Gold',
    item: 'Choice Specs',
    teraType: 'Fighting',
    nature: 'Modest',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Make It Rain', 'Shadow Ball', 'Dazzling Gleam', 'Trick'],
    usage: 38.9,
    description: 'Status-immune special attacker that breaks teams.'
  },

  // ============ OU (OVERUSED) ============
  // Dragapult
  {
    name: 'Dragon Dance Sweeper',
    format: 'ou',
    pokemon: 'dragapult',
    ability: 'Clear Body',
    item: 'Heavy-Duty Boots',
    teraType: 'Ghost',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Dragon Dance', 'Dragon Darts', 'Phantom Force', 'U-turn'],
    usage: 34.2,
    description: 'Setup sweeper that can outspeed and KO after one boost.'
  },
  {
    name: 'Choice Specs Special',
    format: 'ou',
    pokemon: 'dragapult',
    ability: 'Infiltrator',
    item: 'Choice Specs',
    teraType: 'Dragon',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
    moves: ['Shadow Ball', 'Draco Meteor', 'Flamethrower', 'U-turn'],
    usage: 28.7,
    description: 'Special attacking variant with strong coverage.'
  },
  // Kingambit
  {
    name: 'Swords Dance Setup',
    format: 'ou',
    pokemon: 'kingambit',
    ability: 'Supreme Overlord',
    item: 'Leftovers',
    teraType: 'Dark',
    nature: 'Adamant',
    evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    moves: ['Swords Dance', 'Kowtow Cleave', 'Sucker Punch', 'Iron Head'],
    usage: 52.1,
    description: 'Late-game sweeper with Supreme Overlord boosts.'
  },
  {
    name: 'Assault Vest Pivot',
    format: 'ou',
    pokemon: 'kingambit',
    ability: 'Defiant',
    item: 'Assault Vest',
    teraType: 'Flying',
    nature: 'Adamant',
    evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
    moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Low Kick'],
    usage: 31.4,
    description: 'Bulky attacker that punishes Intimidate and Defog.'
  },
  // Great Tusk
  {
    name: 'Bulky Rapid Spinner',
    format: 'ou',
    pokemon: 'great-tusk',
    ability: 'Protosynthesis',
    item: 'Booster Energy',
    teraType: 'Steel',
    nature: 'Jolly',
    evs: { hp: 252, atk: 4, def: 0, spa: 0, spd: 0, spe: 252 },
    moves: ['Headlong Rush', 'Rapid Spin', 'Close Combat', 'Knock Off'],
    usage: 45.8,
    description: 'Hazard removal with excellent speed and bulk.'
  },
  // Gholdengo OU
  {
    name: 'Nasty Plot Sweeper',
    format: 'ou',
    pokemon: 'gholdengo',
    ability: 'Good as Gold',
    item: 'Air Balloon',
    teraType: 'Fighting',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Nasty Plot', 'Make It Rain', 'Shadow Ball', 'Focus Blast'],
    usage: 41.3,
    description: 'Setup sweeper immune to status moves.'
  },
  // Iron Valiant
  {
    name: 'Booster Energy Attacker',
    format: 'ou',
    pokemon: 'iron-valiant',
    ability: 'Quark Drive',
    item: 'Booster Energy',
    teraType: 'Fairy',
    nature: 'Naive',
    evs: { hp: 0, atk: 4, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Moonblast', 'Close Combat', 'Knock Off', 'Encore'],
    usage: 36.9,
    description: 'Fast mixed attacker with great coverage.'
  },

  // ============ UBERS ============
  // Koraidon Ubers
  {
    name: 'Life Orb Sweeper',
    format: 'ubers',
    pokemon: 'koraidon',
    ability: 'Orichalcum Pulse',
    item: 'Life Orb',
    teraType: 'Fire',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Collision Course', 'Flare Blitz', 'Dragon Claw', 'Swords Dance'],
    usage: 38.4,
    description: 'Setup sweeper that dominates in Sun.'
  },
  // Calyrex-Shadow Ubers
  {
    name: 'Choice Scarf Revenge Killer',
    format: 'ubers',
    pokemon: 'calyrex-shadow',
    ability: 'As One',
    item: 'Choice Scarf',
    teraType: 'Ghost',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Astral Barrage', 'Psyshock', 'Trick', 'Leaf Storm'],
    usage: 42.1,
    description: 'Fastest special attacker, great revenge killer.'
  },
  // Arceus
  {
    name: 'Extreme Killer',
    format: 'ubers',
    pokemon: 'arceus',
    ability: 'Multitype',
    item: 'Silk Scarf',
    teraType: 'Normal',
    nature: 'Jolly',
    evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    moves: ['Swords Dance', 'Extreme Speed', 'Shadow Claw', 'Earthquake'],
    usage: 35.6,
    description: 'Classic priority sweeper after a Swords Dance.'
  },

  // ============ NATIONAL DEX ============
  // Mega Mawile
  {
    name: 'Swords Dance Wallbreaker',
    format: 'nationaldex',
    pokemon: 'mawile-mega',
    ability: 'Huge Power',
    item: 'Mawilite',
    teraType: 'Steel',
    nature: 'Adamant',
    evs: { hp: 248, atk: 252, def: 0, spa: 0, spd: 8, spe: 0 },
    moves: ['Swords Dance', 'Play Rough', 'Sucker Punch', 'Fire Fang'],
    usage: 28.9,
    description: 'Devastating wallbreaker with priority Sucker Punch.'
  },
  // Mega Lopunny
  {
    name: 'Offensive Pivot',
    format: 'nationaldex',
    pokemon: 'lopunny-mega',
    ability: 'Scrappy',
    item: 'Lopunnite',
    teraType: 'Fighting',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Fake Out', 'Return', 'High Jump Kick', 'U-turn'],
    usage: 31.2,
    description: 'Fast pivot with Scrappy to hit Ghosts.'
  },
  // Mega Charizard Y
  {
    name: 'Sun Wallbreaker',
    format: 'nationaldex',
    pokemon: 'charizard-mega-y',
    ability: 'Drought',
    item: 'Charizardite Y',
    teraType: 'Fire',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
    moves: ['Flamethrower', 'Solar Beam', 'Focus Blast', 'Roost'],
    usage: 42.5,
    description: 'Weather setter with incredible special attack.'
  },
  // Mega Alakazam
  {
    name: 'Nasty Plot Sweeper',
    format: 'nationaldex',
    pokemon: 'alakazam-mega',
    ability: 'Trace',
    item: 'Alakazite',
    teraType: 'Psychic',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
    moves: ['Nasty Plot', 'Psychic', 'Shadow Ball', 'Focus Blast'],
    usage: 26.8,
    description: 'Fast setup sweeper with great coverage.'
  },
  // Greninja
  {
    name: 'Protean Attacker',
    format: 'nationaldex',
    pokemon: 'greninja',
    ability: 'Protean',
    item: 'Life Orb',
    teraType: 'Water',
    nature: 'Naive',
    evs: { hp: 0, atk: 4, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Hydro Pump', 'Ice Beam', 'Gunk Shot', 'U-turn'],
    usage: 38.4,
    description: 'Versatile attacker that changes type each move.'
  },

  // ============ UU (UNDERUSED) ============
  // Hydreigon
  {
    name: 'Nasty Plot Sweeper',
    format: 'uu',
    pokemon: 'hydreigon',
    ability: 'Levitate',
    item: 'Life Orb',
    teraType: 'Dark',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
    moves: ['Nasty Plot', 'Dark Pulse', 'Draco Meteor', 'Flash Cannon'],
    usage: 35.2,
    description: 'Powerful setup sweeper with great coverage.'
  },
  // Salamence
  {
    name: 'Dragon Dance Sweeper',
    format: 'uu',
    pokemon: 'salamence',
    ability: 'Moxie',
    item: 'Heavy-Duty Boots',
    teraType: 'Flying',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Dragon Dance', 'Outrage', 'Earthquake', 'Dual Wingbeat'],
    usage: 31.8,
    description: 'Classic setup sweeper that snowballs with Moxie.'
  },
  // Scizor
  {
    name: 'Swords Dance',
    format: 'uu',
    pokemon: 'scizor',
    ability: 'Technician',
    item: 'Life Orb',
    teraType: 'Steel',
    nature: 'Adamant',
    evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    moves: ['Swords Dance', 'Bullet Punch', 'Close Combat', 'Knock Off'],
    usage: 28.4,
    description: 'Priority sweeper with powerful Technician Bullet Punch.'
  },
];

// Get movesets for a specific Pokemon
export function getMovesetsByPokemon(pokemonName: string): SmogonMoveset[] {
  const normalizedName = pokemonName.toLowerCase().replace(/\s+/g, '-');
  return SMOGON_MOVESETS.filter(set =>
    set.pokemon.toLowerCase() === normalizedName
  );
}

// Get movesets by format
export function getMovesetsByFormat(format: SmogonFormat): SmogonMoveset[] {
  return SMOGON_MOVESETS.filter(set => set.format === format)
    .sort((a, b) => b.usage - a.usage);
}

// Get top N movesets for a Pokemon
export function getTopMovesets(pokemonName: string, limit: number = 10): SmogonMoveset[] {
  return getMovesetsByPokemon(pokemonName)
    .sort((a, b) => b.usage - a.usage)
    .slice(0, limit);
}

// Get format display name
export function getFormatDisplayName(format: SmogonFormat): string {
  const names: Record<SmogonFormat, string> = {
    'vgc2025': 'VGC 2025',
    'nationaldex': 'National Dex',
    'ubers': 'Ubers',
    'ou': 'OverUsed',
    'uu': 'UnderUsed',
    'ru': 'RarelyUsed',
    'nu': 'NeverUsed'
  };
  return names[format];
}

// EV spread display
export function formatEVs(evs: SmogonMoveset['evs']): string {
  const parts: string[] = [];
  if (evs.hp > 0) parts.push(`${evs.hp} HP`);
  if (evs.atk > 0) parts.push(`${evs.atk} Atk`);
  if (evs.def > 0) parts.push(`${evs.def} Def`);
  if (evs.spa > 0) parts.push(`${evs.spa} SpA`);
  if (evs.spd > 0) parts.push(`${evs.spd} SpD`);
  if (evs.spe > 0) parts.push(`${evs.spe} Spe`);
  return parts.join(' / ');
}
