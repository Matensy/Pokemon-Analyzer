// VGC Usage Statistics and Meta Data
// Based on VGC 2024 Regulation G meta data

export interface UsageData {
  pokemon: string;
  usagePercent: number;
  winRate: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  commonMoves: string[];
  commonItems: string[];
  commonAbilities: string[];
  commonTeammates: string[];
  counters: string[];
  checks: string[];
  role: string[];
}

export const VGC_USAGE_DATA: UsageData[] = [
  // S Tier - Meta Defining
  {
    pokemon: 'flutter-mane',
    usagePercent: 42.5,
    winRate: 53.2,
    tier: 'S',
    commonMoves: ['moonblast', 'shadow-ball', 'dazzling-gleam', 'protect', 'thunderbolt', 'icy-wind'],
    commonItems: ['choice-specs', 'booster-energy', 'focus-sash'],
    commonAbilities: ['protosynthesis'],
    commonTeammates: ['incineroar', 'rillaboom', 'landorus'],
    counters: ['kingambit', 'iron-hands', 'amoonguss'],
    checks: ['incineroar', 'grimmsnarl'],
    role: ['special-attacker', 'speed-control']
  },
  {
    pokemon: 'incineroar',
    usagePercent: 55.8,
    winRate: 50.1,
    tier: 'S',
    commonMoves: ['fake-out', 'flare-blitz', 'knock-off', 'parting-shot', 'protect', 'u-turn'],
    commonItems: ['safety-goggles', 'sitrus-berry', 'assault-vest'],
    commonAbilities: ['intimidate'],
    commonTeammates: ['flutter-mane', 'rillaboom', 'urshifu'],
    counters: ['urshifu', 'palafin'],
    checks: ['landorus', 'garchomp'],
    role: ['support', 'pivot', 'fake-out']
  },
  {
    pokemon: 'rillaboom',
    usagePercent: 38.2,
    winRate: 51.4,
    tier: 'S',
    commonMoves: ['grassy-glide', 'wood-hammer', 'fake-out', 'u-turn', 'protect', 'high-horsepower'],
    commonItems: ['assault-vest', 'miracle-seed', 'choice-band'],
    commonAbilities: ['grassy-surge'],
    commonTeammates: ['incineroar', 'flutter-mane', 'urshifu'],
    counters: ['amoonguss', 'iron-moth'],
    checks: ['tornadus', 'volcarona'],
    role: ['terrain-setter', 'priority', 'fake-out']
  },
  {
    pokemon: 'urshifu',
    usagePercent: 35.6,
    winRate: 52.8,
    tier: 'S',
    commonMoves: ['wicked-blow', 'sucker-punch', 'close-combat', 'protect', 'u-turn'],
    commonItems: ['focus-sash', 'choice-scarf', 'black-glasses'],
    commonAbilities: ['unseen-fist'],
    commonTeammates: ['rillaboom', 'incineroar', 'flutter-mane'],
    counters: ['toxapex', 'amoonguss'],
    checks: ['grimmsnarl', 'whimsicott'],
    role: ['physical-attacker', 'wallbreaker']
  },
  {
    pokemon: 'landorus',
    usagePercent: 32.1,
    winRate: 51.9,
    tier: 'S',
    commonMoves: ['earth-power', 'sludge-bomb', 'protect', 'substitute', 'u-turn', 'rock-slide'],
    commonItems: ['life-orb', 'choice-scarf', 'assault-vest'],
    commonAbilities: ['sheer-force', 'intimidate'],
    commonTeammates: ['incineroar', 'flutter-mane', 'rillaboom'],
    counters: ['cresselia', 'ice-types'],
    checks: ['flutter-mane', 'water-types'],
    role: ['special-attacker', 'ground-coverage']
  },

  // A Tier - Very Strong
  {
    pokemon: 'iron-hands',
    usagePercent: 28.4,
    winRate: 50.8,
    tier: 'A',
    commonMoves: ['drain-punch', 'fake-out', 'wild-charge', 'heavy-slam', 'protect', 'thunder-punch'],
    commonItems: ['assault-vest', 'booster-energy', 'sitrus-berry'],
    commonAbilities: ['quark-drive'],
    commonTeammates: ['flutter-mane', 'incineroar', 'amoonguss'],
    counters: ['landorus', 'garchomp'],
    checks: ['cresselia', 'drifblim'],
    role: ['physical-attacker', 'fake-out', 'bulk']
  },
  {
    pokemon: 'amoonguss',
    usagePercent: 26.7,
    winRate: 51.2,
    tier: 'A',
    commonMoves: ['spore', 'rage-powder', 'pollen-puff', 'protect', 'clear-smog'],
    commonItems: ['rocky-helmet', 'sitrus-berry', 'mental-herb'],
    commonAbilities: ['regenerator'],
    commonTeammates: ['iron-hands', 'urshifu', 'flutter-mane'],
    counters: ['iron-moth', 'volcarona'],
    checks: ['taunt-users'],
    role: ['support', 'redirection', 'sleep']
  },
  {
    pokemon: 'kingambit',
    usagePercent: 24.3,
    winRate: 52.1,
    tier: 'A',
    commonMoves: ['kowtow-cleave', 'sucker-punch', 'iron-head', 'protect', 'swords-dance'],
    commonItems: ['assault-vest', 'life-orb', 'black-glasses'],
    commonAbilities: ['supreme-overlord', 'defiant'],
    commonTeammates: ['incineroar', 'tornadus', 'grimmsnarl'],
    counters: ['iron-hands', 'urshifu'],
    checks: ['incineroar', 'fighting-types'],
    role: ['physical-attacker', 'late-game']
  },
  {
    pokemon: 'tornadus',
    usagePercent: 22.8,
    winRate: 50.5,
    tier: 'A',
    commonMoves: ['tailwind', 'bleakwind-storm', 'rain-dance', 'protect', 'taunt'],
    commonItems: ['focus-sash', 'covert-cloak', 'sitrus-berry'],
    commonAbilities: ['prankster'],
    commonTeammates: ['urshifu', 'palafin', 'flutter-mane'],
    counters: ['grimmsnarl', 'murkrow'],
    checks: ['rock-types', 'electric-types'],
    role: ['speed-control', 'support', 'rain-setter']
  },
  {
    pokemon: 'chi-yu',
    usagePercent: 21.5,
    winRate: 53.8,
    tier: 'A',
    commonMoves: ['heat-wave', 'dark-pulse', 'overheat', 'protect', 'snarl'],
    commonItems: ['choice-scarf', 'choice-specs', 'focus-sash'],
    commonAbilities: ['beads-of-ruin'],
    commonTeammates: ['whimsicott', 'incineroar', 'arcanine'],
    counters: ['water-types', 'heatran'],
    checks: ['flutter-mane', 'rock-types'],
    role: ['special-attacker', 'wallbreaker']
  },

  // B Tier - Strong Options
  {
    pokemon: 'garchomp',
    usagePercent: 18.9,
    winRate: 50.2,
    tier: 'B',
    commonMoves: ['earthquake', 'dragon-claw', 'protect', 'rock-slide', 'swords-dance'],
    commonItems: ['life-orb', 'assault-vest', 'choice-scarf'],
    commonAbilities: ['rough-skin'],
    commonTeammates: ['incineroar', 'rillaboom', 'flutter-mane'],
    counters: ['ice-types', 'fairy-types'],
    checks: ['landorus', 'cresselia'],
    role: ['physical-attacker', 'ground-coverage']
  },
  {
    pokemon: 'gholdengo',
    usagePercent: 17.4,
    winRate: 51.6,
    tier: 'B',
    commonMoves: ['make-it-rain', 'shadow-ball', 'protect', 'nasty-plot', 'thunderbolt'],
    commonItems: ['choice-specs', 'air-balloon', 'focus-sash'],
    commonAbilities: ['good-as-gold'],
    commonTeammates: ['grimmsnarl', 'incineroar', 'arcanine'],
    counters: ['dark-types', 'ground-types'],
    checks: ['kingambit', 'chi-yu'],
    role: ['special-attacker', 'hazard-immune']
  },
  {
    pokemon: 'palafin',
    usagePercent: 16.2,
    winRate: 52.4,
    tier: 'B',
    commonMoves: ['wave-crash', 'jet-punch', 'close-combat', 'protect', 'flip-turn'],
    commonItems: ['mystic-water', 'choice-band', 'life-orb'],
    commonAbilities: ['zero-to-hero'],
    commonTeammates: ['tornadus', 'incineroar', 'grimmsnarl'],
    counters: ['amoonguss', 'rillaboom'],
    checks: ['electric-types'],
    role: ['physical-attacker', 'priority']
  },
  {
    pokemon: 'chien-pao',
    usagePercent: 15.8,
    winRate: 51.1,
    tier: 'B',
    commonMoves: ['ice-spinner', 'crunch', 'sucker-punch', 'protect', 'sacred-sword'],
    commonItems: ['focus-sash', 'life-orb', 'clear-amulet'],
    commonAbilities: ['sword-of-ruin'],
    commonTeammates: ['urshifu', 'incineroar', 'rillaboom'],
    counters: ['iron-hands', 'arcanine'],
    checks: ['steel-types', 'fighting-types'],
    role: ['physical-attacker', 'ice-coverage']
  },
  {
    pokemon: 'iron-bundle',
    usagePercent: 14.6,
    winRate: 50.9,
    tier: 'B',
    commonMoves: ['freeze-dry', 'hydro-pump', 'icy-wind', 'protect', 'encore'],
    commonItems: ['booster-energy', 'choice-specs', 'focus-sash'],
    commonAbilities: ['quark-drive'],
    commonTeammates: ['flutter-mane', 'iron-hands', 'incineroar'],
    counters: ['iron-hands', 'rillaboom'],
    checks: ['special-walls'],
    role: ['special-attacker', 'speed-control']
  },

  // C Tier - Viable Options
  {
    pokemon: 'arcanine',
    usagePercent: 12.3,
    winRate: 49.8,
    tier: 'C',
    commonMoves: ['flare-blitz', 'extreme-speed', 'will-o-wisp', 'protect', 'snarl', 'helping-hand'],
    commonItems: ['sitrus-berry', 'assault-vest', 'safety-goggles'],
    commonAbilities: ['intimidate'],
    commonTeammates: ['flutter-mane', 'gholdengo', 'kingambit'],
    counters: ['water-types', 'rock-types'],
    checks: ['landorus', 'garchomp'],
    role: ['support', 'intimidate', 'priority']
  },
  {
    pokemon: 'cresselia',
    usagePercent: 11.5,
    winRate: 50.3,
    tier: 'C',
    commonMoves: ['trick-room', 'moonblast', 'ice-beam', 'ally-switch', 'helping-hand', 'lunar-dance'],
    commonItems: ['sitrus-berry', 'mental-herb', 'safety-goggles'],
    commonAbilities: ['levitate'],
    commonTeammates: ['iron-hands', 'ursaluna', 'torkoal'],
    counters: ['dark-types', 'kingambit'],
    checks: ['urshifu', 'chi-yu'],
    role: ['trick-room', 'support', 'bulk']
  },
  {
    pokemon: 'grimmsnarl',
    usagePercent: 10.8,
    winRate: 49.5,
    tier: 'C',
    commonMoves: ['spirit-break', 'fake-out', 'thunder-wave', 'taunt', 'light-screen', 'reflect'],
    commonItems: ['light-clay', 'sitrus-berry', 'eject-button'],
    commonAbilities: ['prankster'],
    commonTeammates: ['flutter-mane', 'kingambit', 'palafin'],
    counters: ['steel-types', 'amoonguss'],
    checks: ['incineroar'],
    role: ['screens', 'fake-out', 'speed-control']
  },
  {
    pokemon: 'iron-moth',
    usagePercent: 9.7,
    winRate: 51.4,
    tier: 'C',
    commonMoves: ['fiery-dance', 'sludge-wave', 'energy-ball', 'protect', 'psychic'],
    commonItems: ['booster-energy', 'choice-specs', 'focus-sash'],
    commonAbilities: ['quark-drive'],
    commonTeammates: ['iron-hands', 'incineroar', 'flutter-mane'],
    counters: ['ground-types', 'water-types'],
    checks: ['landorus', 'palafin'],
    role: ['special-attacker', 'grass-counter']
  },
  {
    pokemon: 'ting-lu',
    usagePercent: 8.9,
    winRate: 50.6,
    tier: 'C',
    commonMoves: ['earthquake', 'throat-chop', 'ruination', 'protect', 'stomping-tantrum'],
    commonItems: ['leftovers', 'assault-vest', 'sitrus-berry'],
    commonAbilities: ['vessel-of-ruin'],
    commonTeammates: ['flutter-mane', 'incineroar', 'tornadus'],
    counters: ['ice-types', 'water-types'],
    checks: ['rillaboom', 'urshifu'],
    role: ['physical-wall', 'sp-def-drop']
  },

  // D Tier - Niche/Anti-Meta
  {
    pokemon: 'drifblim',
    usagePercent: 5.4,
    winRate: 49.2,
    tier: 'D',
    commonMoves: ['tailwind', 'will-o-wisp', 'shadow-ball', 'strength-sap', 'hypnosis'],
    commonItems: ['sitrus-berry', 'mental-herb', 'focus-sash'],
    commonAbilities: ['unburden'],
    commonTeammates: ['iron-hands', 'ursaluna', 'armarouge'],
    counters: ['dark-types', 'taunt-users'],
    checks: ['ghost-types'],
    role: ['speed-control', 'support']
  },
  {
    pokemon: 'torkoal',
    usagePercent: 4.8,
    winRate: 48.9,
    tier: 'D',
    commonMoves: ['eruption', 'heat-wave', 'earth-power', 'protect', 'yawn'],
    commonItems: ['charcoal', 'sitrus-berry', 'heat-rock'],
    commonAbilities: ['drought'],
    commonTeammates: ['venusaur', 'cresselia', 'armarouge'],
    counters: ['water-types', 'rock-types'],
    checks: ['rain-teams'],
    role: ['sun-setter', 'trick-room']
  },
  {
    pokemon: 'pelipper',
    usagePercent: 4.2,
    winRate: 48.5,
    tier: 'D',
    commonMoves: ['weather-ball', 'hurricane', 'protect', 'tailwind', 'u-turn'],
    commonItems: ['focus-sash', 'damp-rock', 'sitrus-berry'],
    commonAbilities: ['drizzle'],
    commonTeammates: ['palafin', 'urshifu', 'kingdra'],
    counters: ['electric-types', 'rillaboom'],
    checks: ['rock-types'],
    role: ['rain-setter', 'speed-control']
  },
  {
    pokemon: 'whimsicott',
    usagePercent: 3.9,
    winRate: 48.1,
    tier: 'D',
    commonMoves: ['tailwind', 'encore', 'moonblast', 'protect', 'helping-hand', 'beat-up'],
    commonItems: ['focus-sash', 'eject-button', 'mental-herb'],
    commonAbilities: ['prankster'],
    commonTeammates: ['chi-yu', 'kingambit', 'urshifu'],
    counters: ['grass-types', 'steel-types'],
    checks: ['incineroar', 'taunt-users'],
    role: ['speed-control', 'support']
  },
  {
    pokemon: 'tyranitar',
    usagePercent: 3.6,
    winRate: 49.8,
    tier: 'D',
    commonMoves: ['rock-slide', 'crunch', 'low-kick', 'protect', 'dragon-dance'],
    commonItems: ['assault-vest', 'weakness-policy', 'choice-scarf'],
    commonAbilities: ['sand-stream'],
    commonTeammates: ['excadrill', 'landorus', 'incineroar'],
    counters: ['fighting-types', 'urshifu'],
    checks: ['iron-hands', 'rillaboom'],
    role: ['sand-setter', 'physical-attacker']
  }
];

// Common VGC team archetypes
export interface TeamArchetype {
  name: string;
  description: string;
  coreMembers: string[];
  strategy: string;
  strengths: string[];
  weaknesses: string[];
}

export const TEAM_ARCHETYPES: TeamArchetype[] = [
  {
    name: 'Standard Goodstuffs',
    description: 'Well-rounded team with top meta Pokemon covering each other\'s weaknesses.',
    coreMembers: ['incineroar', 'flutter-mane', 'rillaboom', 'landorus'],
    strategy: 'Flexible gameplan with strong neutral coverage and pivoting.',
    strengths: ['Adaptable to any matchup', 'High individual Pokemon power', 'Good speed control'],
    weaknesses: ['Predictable', 'Can be outplayed by specialized teams']
  },
  {
    name: 'Rain',
    description: 'Weather-based team centered around Rain-boosted Water moves.',
    coreMembers: ['pelipper', 'palafin', 'urshifu', 'tornadus'],
    strategy: 'Set rain with Pelipper, sweep with boosted Water attackers.',
    strengths: ['Powerful Water moves', 'Swift Swim speed control', 'Anti-Fire'],
    weaknesses: ['Weather wars', 'Rillaboom/Grassy Terrain', 'Electric types']
  },
  {
    name: 'Sun',
    description: 'Weather-based team centered around Harsh Sunlight.',
    coreMembers: ['torkoal', 'venusaur', 'armarouge', 'cresselia'],
    strategy: 'Set sun, use Chlorophyll sweepers and boosted Fire moves.',
    strengths: ['Doubled Chlorophyll speed', 'Powerful Fire moves', 'Sleep Powder'],
    weaknesses: ['Weather wars', 'Rock Slide', 'Flash Fire']
  },
  {
    name: 'Sand',
    description: 'Weather-based team using Sandstorm for chip damage and boosts.',
    coreMembers: ['tyranitar', 'excadrill', 'landorus', 'incineroar'],
    strategy: 'Set sand, use Sand Rush/Force abilities while chipping opponent.',
    strengths: ['Rock SpDef boost', 'Sand Rush speed', 'Strong Ground coverage'],
    weaknesses: ['Fighting weakness', 'Weather wars', 'Water/Grass types']
  },
  {
    name: 'Trick Room',
    description: 'Speed control team using Trick Room to outspeed with slow Pokemon.',
    coreMembers: ['cresselia', 'iron-hands', 'ursaluna', 'amoonguss'],
    strategy: 'Set Trick Room, sweep with slow but powerful attackers.',
    strengths: ['Reverses speed meta', 'Bulky attackers', 'Anti-fast teams'],
    weaknesses: ['Taunt', 'Fake Out pressure', 'Trick Room counters']
  },
  {
    name: 'Hyper Offense',
    description: 'Fast, aggressive team focused on overwhelming before opponent reacts.',
    coreMembers: ['flutter-mane', 'chien-pao', 'urshifu', 'tornadus'],
    strategy: 'Tailwind + fast sweepers to overwhelm with damage before taking hits.',
    strengths: ['High damage output', 'Fast kills', 'Momentum'],
    weaknesses: ['Trick Room', 'Priority moves', 'Focus Sash']
  },
  {
    name: 'Bulky Offense',
    description: 'Balanced team with bulky attackers that can take hits while dealing damage.',
    coreMembers: ['kingambit', 'iron-hands', 'amoonguss', 'grimmsnarl'],
    strategy: 'Use bulk to survive while setting up or pivoting, then clean up.',
    strengths: ['Survives hits', 'Chip damage accumulation', 'Late-game'],
    weaknesses: ['Gets worn down', 'Speed control', 'Status effects']
  }
];

// Speed tiers for VGC (Base speed at level 50)
export const SPEED_TIERS = [
  { tier: 'Ultra Fast', minSpeed: 140, pokemon: ['flutter-mane', 'dragapult', 'iron-bundle'] },
  { tier: 'Very Fast', minSpeed: 120, pokemon: ['cinderace', 'zeraora', 'alakazam'] },
  { tier: 'Fast', minSpeed: 100, pokemon: ['landorus', 'chi-yu', 'garchomp'] },
  { tier: 'Medium Fast', minSpeed: 85, pokemon: ['urshifu', 'palafin', 'kingambit'] },
  { tier: 'Medium', minSpeed: 70, pokemon: ['rillaboom', 'amoonguss'] },
  { tier: 'Slow', minSpeed: 50, pokemon: ['incineroar', 'iron-hands', 'tyranitar'] },
  { tier: 'Very Slow', minSpeed: 30, pokemon: ['torkoal', 'ursaluna', 'dusclops'] }
];

export function getUsageData(pokemonName: string): UsageData | undefined {
  const normalized = pokemonName.toLowerCase().replace(/\s+/g, '-');
  return VGC_USAGE_DATA.find(p => p.pokemon === normalized);
}

export function getTierPokemon(tier: 'S' | 'A' | 'B' | 'C' | 'D'): UsageData[] {
  return VGC_USAGE_DATA.filter(p => p.tier === tier);
}

export function getCounters(pokemonName: string): string[] {
  const data = getUsageData(pokemonName);
  return data?.counters || [];
}

export function getTeammates(pokemonName: string): string[] {
  const data = getUsageData(pokemonName);
  return data?.commonTeammates || [];
}
