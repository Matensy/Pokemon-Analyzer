import { Pokemon, Moveset } from '../types/pokemon';

// Signature moves that should ALWAYS be included for specific Pokemon
const signatureMoves: Record<string, string[]> = {
  // Legendaries Gen 1-3
  'mewtwo': ['psystrike', 'psychic', 'aura-sphere', 'ice-beam'],
  'mew': ['psychic', 'transform', 'aura-sphere', 'soft-boiled'],
  'lugia': ['aeroblast', 'psychic', 'hydro-pump', 'recover'],
  'ho-oh': ['sacred-fire', 'brave-bird', 'earthquake', 'recover'],
  'kyogre': ['origin-pulse', 'water-spout', 'thunder', 'ice-beam'],
  'groudon': ['precipice-blades', 'earthquake', 'fire-punch', 'stone-edge'],
  'rayquaza': ['dragon-ascent', 'outrage', 'extreme-speed', 'v-create'],
  'deoxys': ['psycho-boost', 'psychic', 'superpower', 'extreme-speed'],

  // Gen 4 Legends
  'dialga': ['roar-of-time', 'flash-cannon', 'draco-meteor', 'thunder'],
  'palkia': ['spacial-rend', 'hydro-pump', 'draco-meteor', 'thunder'],
  'giratina': ['shadow-force', 'dragon-claw', 'earthquake', 'will-o-wisp'],
  'arceus': ['judgment', 'extreme-speed', 'swords-dance', 'shadow-claw'],
  'darkrai': ['dark-void', 'dark-pulse', 'nasty-plot', 'sludge-bomb'],
  'cresselia': ['moonblast', 'psychic', 'moonlight', 'thunder-wave'],

  // Gen 5 Legends
  'reshiram': ['blue-flare', 'draco-meteor', 'fusion-flare', 'roost'],
  'zekrom': ['bolt-strike', 'outrage', 'fusion-bolt', 'roost'],
  'kyurem': ['glaciate', 'draco-meteor', 'ice-beam', 'earth-power'],
  'kyurem-black': ['freeze-shock', 'outrage', 'fusion-bolt', 'ice-beam'],
  'kyurem-white': ['ice-burn', 'draco-meteor', 'fusion-flare', 'earth-power'],
  'victini': ['v-create', 'bolt-strike', 'zen-headbutt', 'u-turn'],
  'keldeo': ['secret-sword', 'hydro-pump', 'calm-mind', 'scald'],
  'meloetta': ['relic-song', 'psychic', 'close-combat', 'hyper-voice'],
  'genesect': ['techno-blast', 'iron-head', 'u-turn', 'flamethrower'],

  // Gen 6 Legends
  'xerneas': ['geomancy', 'moonblast', 'thunder', 'focus-blast'],
  'yveltal': ['oblivion-wing', 'dark-pulse', 'sucker-punch', 'roost'],
  'zygarde': ['thousand-arrows', 'thousand-waves', 'dragon-dance', 'extreme-speed'],
  'diancie': ['diamond-storm', 'moonblast', 'earth-power', 'protect'],
  'hoopa': ['hyperspace-hole', 'psychic', 'shadow-ball', 'trick'],
  'volcanion': ['steam-eruption', 'flamethrower', 'sludge-bomb', 'earth-power'],

  // Gen 7 Legends
  'solgaleo': ['sunsteel-strike', 'flare-blitz', 'earthquake', 'morning-sun'],
  'lunala': ['moongeist-beam', 'moonblast', 'focus-blast', 'roost'],
  'necrozma': ['photon-geyser', 'earthquake', 'stone-edge', 'swords-dance'],
  'magearna': ['fleur-cannon', 'flash-cannon', 'aura-sphere', 'calm-mind'],
  'marshadow': ['spectral-thief', 'close-combat', 'shadow-sneak', 'bulk-up'],
  'zeraora': ['plasma-fists', 'close-combat', 'play-rough', 'knock-off'],

  // Gen 8 Legends
  'zacian': ['behemoth-blade', 'play-rough', 'close-combat', 'swords-dance'],
  'zamazenta': ['behemoth-bash', 'close-combat', 'crunch', 'iron-defense'],
  'eternatus': ['dynamax-cannon', 'eternabeam', 'sludge-bomb', 'flamethrower'],
  'urshifu': ['wicked-blow', 'close-combat', 'sucker-punch', 'u-turn'],
  'urshifu-rapid-strike': ['surging-strikes', 'close-combat', 'aqua-jet', 'u-turn'],
  'calyrex': ['glacial-lance', 'astral-barrage', 'trick-room', 'psychic'],
  'calyrex-ice-rider': ['glacial-lance', 'high-horsepower', 'close-combat', 'trick-room'],
  'calyrex-shadow-rider': ['astral-barrage', 'psychic', 'nasty-plot', 'trick-room'],
  'regieleki': ['thunder-cage', 'thunderbolt', 'volt-switch', 'explosion'],
  'regidrago': ['dragon-energy', 'outrage', 'crunch', 'hammer-arm'],

  // Gen 9 Legends
  'koraidon': ['collision-course', 'flare-blitz', 'outrage', 'drain-punch'],
  'miraidon': ['electro-drift', 'draco-meteor', 'overheat', 'volt-switch'],
  'terapagos': ['tera-starstorm', 'earth-power', 'ice-beam', 'calm-mind'],
  'ogerpon': ['ivy-cudgel', 'horn-leech', 'play-rough', 'u-turn'],
  'pecharunt': ['malignant-chain', 'shadow-ball', 'destiny-bond', 'nasty-plot'],

  // Mega-capable Pokemon
  'charizard': ['flare-blitz', 'dragon-claw', 'earthquake', 'dragon-dance'],
  'blastoise': ['shell-smash', 'hydro-pump', 'ice-beam', 'dark-pulse'],
  'venusaur': ['giga-drain', 'sludge-bomb', 'earth-power', 'synthesis'],
  'alakazam': ['psychic', 'shadow-ball', 'focus-blast', 'nasty-plot'],
  'gengar': ['shadow-ball', 'sludge-wave', 'focus-blast', 'nasty-plot'],
  'kangaskhan': ['return', 'sucker-punch', 'earthquake', 'power-up-punch'],
  'pinsir': ['x-scissor', 'close-combat', 'earthquake', 'swords-dance'],
  'gyarados': ['waterfall', 'earthquake', 'ice-fang', 'dragon-dance'],
  'aerodactyl': ['stone-edge', 'earthquake', 'fire-fang', 'roost'],
  'metagross': ['meteor-mash', 'earthquake', 'zen-headbutt', 'bullet-punch'],
  'salamence': ['outrage', 'earthquake', 'fire-blast', 'dragon-dance'],
  'garchomp': ['earthquake', 'outrage', 'stone-edge', 'swords-dance'],
  'lucario': ['close-combat', 'extreme-speed', 'meteor-mash', 'swords-dance'],

  // Popular competitive Pokemon
  'tyranitar': ['stone-edge', 'crunch', 'earthquake', 'dragon-dance'],
  'dragonite': ['outrage', 'extreme-speed', 'earthquake', 'dragon-dance'],
  'scizor': ['bullet-punch', 'u-turn', 'superpower', 'swords-dance'],
  'ferrothorn': ['power-whip', 'gyro-ball', 'stealth-rock', 'leech-seed'],
  'toxapex': ['scald', 'toxic', 'recover', 'haze'],
  'landorus': ['earthquake', 'u-turn', 'stone-edge', 'swords-dance'],
  'tapu-koko': ['thunderbolt', 'dazzling-gleam', 'u-turn', 'roost'],
  'tapu-lele': ['psychic', 'moonblast', 'focus-blast', 'calm-mind'],
  'tapu-bulu': ['wood-hammer', 'superpower', 'stone-edge', 'swords-dance'],
  'tapu-fini': ['moonblast', 'scald', 'calm-mind', 'defog'],
  'mimikyu': ['play-rough', 'shadow-claw', 'swords-dance', 'shadow-sneak'],
  'dragapult': ['draco-meteor', 'shadow-ball', 'fire-blast', 'u-turn'],
  'cinderace': ['pyro-ball', 'high-jump-kick', 'gunk-shot', 'u-turn'],
  'rillaboom': ['grassy-glide', 'knock-off', 'high-horsepower', 'swords-dance'],
  'inteleon': ['snipe-shot', 'ice-beam', 'dark-pulse', 'hydro-pump'],

  // Ultra Beasts
  'nihilego': ['meteor-beam', 'sludge-wave', 'power-gem', 'grass-knot'],
  'buzzwole': ['superpower', 'leech-life', 'ice-punch', 'roost'],
  'pheromosa': ['close-combat', 'triple-axel', 'u-turn', 'poison-jab'],
  'xurkitree': ['thunderbolt', 'energy-ball', 'dazzling-gleam', 'volt-switch'],
  'celesteela': ['heavy-slam', 'flamethrower', 'air-slash', 'leech-seed'],
  'kartana': ['leaf-blade', 'sacred-sword', 'smart-strike', 'swords-dance'],
  'guzzlord': ['draco-meteor', 'knock-off', 'fire-blast', 'drain-punch'],
  'poipole': ['sludge-bomb', 'draco-meteor', 'nasty-plot', 'heat-wave'],
  'naganadel': ['draco-meteor', 'sludge-wave', 'fire-blast', 'nasty-plot'],
  'stakataka': ['gyro-ball', 'stone-edge', 'earthquake', 'trick-room'],
  'blacephalon': ['shadow-ball', 'flamethrower', 'mind-blown', 'trick'],

  // Paradox Pokemon
  'great-tusk': ['headlong-rush', 'close-combat', 'ice-spinner', 'knock-off'],
  'scream-tail': ['hyper-voice', 'dazzling-gleam', 'psychic', 'calm-mind'],
  'brute-bonnet': ['bullet-seed', 'sucker-punch', 'crunch', 'spore'],
  'flutter-mane': ['moonblast', 'shadow-ball', 'mystical-fire', 'calm-mind'],
  'slither-wing': ['first-impression', 'close-combat', 'flare-blitz', 'u-turn'],
  'sandy-shocks': ['earth-power', 'thunderbolt', 'stealth-rock', 'volt-switch'],
  'iron-treads': ['earthquake', 'iron-head', 'ice-spinner', 'rapid-spin'],
  'iron-bundle': ['hydro-pump', 'freeze-dry', 'flip-turn', 'ice-beam'],
  'iron-hands': ['drain-punch', 'thunder-punch', 'ice-punch', 'belly-drum'],
  'iron-jugulis': ['dark-pulse', 'hurricane', 'earth-power', 'u-turn'],
  'iron-moth': ['fiery-dance', 'energy-ball', 'psychic', 'acid-spray'],
  'iron-thorns': ['stone-edge', 'wild-charge', 'earthquake', 'swords-dance'],
  'iron-valiant': ['moonblast', 'close-combat', 'psycho-cut', 'swords-dance'],
  'roaring-moon': ['acrobatics', 'crunch', 'earthquake', 'dragon-dance'],
  'iron-leaves': ['psyblade', 'sacred-sword', 'leaf-blade', 'swords-dance'],
  'walking-wake': ['hydro-steam', 'draco-meteor', 'flamethrower', 'dragon-pulse'],
  'gouging-fire': ['burning-bulwark', 'flare-blitz', 'outrage', 'dragon-dance'],
  'raging-bolt': ['thunderclap', 'draco-meteor', 'thunderbolt', 'calm-mind'],
  'iron-boulder': ['mighty-cleave', 'close-combat', 'stone-edge', 'swords-dance'],
  'iron-crown': ['tachyon-cutter', 'psychic', 'flash-cannon', 'calm-mind'],
};

// Recommended items by role
const items = {
  sweeper: ['Life Orb', 'Choice Band', 'Choice Specs', 'Focus Sash'],
  tank: ['Assault Vest', 'Leftovers', 'Rocky Helmet', 'Heavy-Duty Boots'],
  wall: ['Leftovers', 'Rocky Helmet', 'Eviolite', 'Heavy-Duty Boots'],
  support: ['Light Clay', 'Mental Herb', 'Focus Sash', 'Eject Button'],
  setup: ['Life Orb', 'Leftovers', 'Weakness Policy', 'Lum Berry']
};

// Recommended natures
const natures = {
  physical: ['Adamant', 'Jolly', 'Brave', 'Impish'],
  special: ['Modest', 'Timid', 'Quiet', 'Calm'],
  mixed: ['Hasty', 'Naive', 'Lonely', 'Mild'],
  defensive: ['Bold', 'Impish', 'Calm', 'Careful']
};

// Common competitive moves by category
const commonMoves: Record<string, string[]> = {
  recovery: ['recover', 'roost', 'slack-off', 'moonlight', 'morning-sun', 'synthesis', 'rest', 'wish', 'soft-boiled', 'shore-up'],
  priority: ['aqua-jet', 'bullet-punch', 'extreme-speed', 'ice-shard', 'mach-punch', 'sucker-punch', 'shadow-sneak', 'quick-attack', 'accelerock', 'grassy-glide'],
  setup: ['swords-dance', 'dragon-dance', 'nasty-plot', 'calm-mind', 'bulk-up', 'quiver-dance', 'shell-smash', 'belly-drum', 'shift-gear', 'geomancy'],
  hazards: ['stealth-rock', 'spikes', 'toxic-spikes', 'sticky-web'],
  removal: ['rapid-spin', 'defog'],
  status: ['thunder-wave', 'toxic', 'will-o-wisp', 'spore', 'sleep-powder', 'yawn', 'glare'],
  utility: ['protect', 'substitute', 'u-turn', 'volt-switch', 'flip-turn', 'teleport', 'parting-shot', 'baton-pass'],
  screen: ['reflect', 'light-screen', 'aurora-veil']
};

function determineRole(pokemon: Pokemon): string {
  const { stats } = pokemon;
  const { attack, defense, specialAttack, specialDefense, speed, hp } = stats;

  const isFast = speed >= 100;
  const isBulky = (defense + specialDefense) >= 180;
  const hasGoodHP = hp >= 90;

  if (isFast && (attack >= 100 || specialAttack >= 100)) {
    return 'sweeper';
  } else if (isBulky && hasGoodHP) {
    if (defense > specialDefense) {
      return 'physical-wall';
    } else {
      return 'special-wall';
    }
  } else if (hasGoodHP && (defense >= 80 || specialDefense >= 80)) {
    return 'tank';
  } else if (stats.total >= 500) {
    return 'setup';
  } else {
    return 'support';
  }
}

function formatMoveName(name: string): string {
  return name.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getBestMoves(pokemon: Pokemon, role: string, count: number = 4): string[] {
  const pokemonName = pokemon.name.toLowerCase();

  // Check for signature moves FIRST
  if (signatureMoves[pokemonName]) {
    const signature = signatureMoves[pokemonName];
    // Return signature moves (already has 4 moves)
    return signature.slice(0, count).map(formatMoveName);
  }

  const moves = pokemon.moves;
  const selected: string[] = [];

  // Filter moves with actual power (attacking moves)
  const attackingMoves = moves.filter(m => m.power && m.power > 0);

  // Get STAB moves (Same Type Attack Bonus)
  const stabMoves = attackingMoves.filter(m =>
    pokemon.types.includes(m.type) && m.power && m.power >= 60
  ).sort((a, b) => (b.power || 0) - (a.power || 0));

  // Get coverage moves (non-STAB but good power)
  const coverageMoves = attackingMoves.filter(m =>
    !pokemon.types.includes(m.type) && m.power && m.power >= 60
  ).sort((a, b) => (b.power || 0) - (a.power || 0));

  // Determine if physical or special attacker
  const isPhysical = pokemon.stats.attack > pokemon.stats.specialAttack;
  const preferredCategory = isPhysical ? 'physical' : 'special';

  // Add best STAB move
  const bestStab = stabMoves.find(m => m.category === preferredCategory) || stabMoves[0];
  if (bestStab) {
    selected.push(formatMoveName(bestStab.name));
  }

  // Add second STAB if dual-type
  if (pokemon.types.length > 1 && selected.length < count) {
    const secondTypeStab = stabMoves.find(m =>
      m.type === pokemon.types[1] &&
      !selected.includes(formatMoveName(m.name)) &&
      m.category === preferredCategory
    );
    if (secondTypeStab) {
      selected.push(formatMoveName(secondTypeStab.name));
    }
  }

  // Add setup move if setup sweeper
  if (role === 'setup' && selected.length < count) {
    const setupMove = moves.find(m => commonMoves.setup.includes(m.name.toLowerCase()));
    if (setupMove && !selected.includes(formatMoveName(setupMove.name))) {
      selected.push(formatMoveName(setupMove.name));
    }
  }

  // Add priority move for sweepers
  if (role === 'sweeper' && selected.length < count) {
    const priorityMove = moves.find(m =>
      commonMoves.priority.includes(m.name.toLowerCase()) &&
      !selected.includes(formatMoveName(m.name))
    );
    if (priorityMove) {
      selected.push(formatMoveName(priorityMove.name));
    }
  }

  // Add recovery for walls/tanks
  if ((role.includes('wall') || role === 'tank') && selected.length < count) {
    const recoveryMove = moves.find(m =>
      commonMoves.recovery.includes(m.name.toLowerCase()) &&
      !selected.includes(formatMoveName(m.name))
    );
    if (recoveryMove) {
      selected.push(formatMoveName(recoveryMove.name));
    }
  }

  // Add utility for walls
  if (role.includes('wall') && selected.length < count) {
    const utilityMove = moves.find(m =>
      commonMoves.status.includes(m.name.toLowerCase()) &&
      !selected.includes(formatMoveName(m.name))
    );
    if (utilityMove) {
      selected.push(formatMoveName(utilityMove.name));
    }
  }

  // Fill with coverage moves
  for (const move of coverageMoves) {
    if (selected.length >= count) break;
    const formattedName = formatMoveName(move.name);
    if (!selected.includes(formattedName) && move.category === preferredCategory) {
      selected.push(formattedName);
    }
  }

  // Fill remaining with any good moves
  const remainingMoves = attackingMoves
    .filter(m => !selected.includes(formatMoveName(m.name)))
    .sort((a, b) => (b.power || 0) - (a.power || 0));

  for (const move of remainingMoves) {
    if (selected.length >= count) break;
    selected.push(formatMoveName(move.name));
  }

  // If still not enough, add any moves
  if (selected.length < count) {
    for (const move of moves) {
      if (selected.length >= count) break;
      const formattedName = formatMoveName(move.name);
      if (!selected.includes(formattedName)) {
        selected.push(formattedName);
      }
    }
  }

  return selected.slice(0, count);
}

export function generateMovesets(pokemon: Pokemon): Moveset[] {
  const role = determineRole(pokemon);
  const movesets: Moveset[] = [];

  const isPhysical = pokemon.stats.attack > pokemon.stats.specialAttack;
  const preferredAbility = pokemon.abilities.find(a => !a.isHidden) || pokemon.abilities[0];

  // Main competitive set
  if (role === 'sweeper') {
    movesets.push({
      role: 'Offensive Sweeper',
      moves: getBestMoves(pokemon, 'sweeper'),
      ability: preferredAbility?.name || 'Unknown',
      item: items.sweeper[0],
      nature: isPhysical ? natures.physical[1] : natures.special[1], // Jolly or Timid
      evs: {
        hp: 0,
        attack: isPhysical ? 252 : 0,
        defense: 0,
        specialAttack: isPhysical ? 0 : 252,
        specialDefense: 4,
        speed: 252
      },
      description: 'Fast offensive sweeper focused on dealing maximum damage'
    });
  } else if (role === 'setup') {
    movesets.push({
      role: 'Setup Sweeper',
      moves: getBestMoves(pokemon, 'setup'),
      ability: preferredAbility?.name || 'Unknown',
      item: items.setup[0],
      nature: isPhysical ? natures.physical[0] : natures.special[0], // Adamant or Modest
      evs: {
        hp: 4,
        attack: isPhysical ? 252 : 0,
        defense: 0,
        specialAttack: isPhysical ? 0 : 252,
        specialDefense: 0,
        speed: 252
      },
      description: 'Setup sweeper that boosts stats before attacking'
    });
  } else if (role.includes('wall')) {
    const isPhysicalWall = role === 'physical-wall';
    movesets.push({
      role: isPhysicalWall ? 'Physical Wall' : 'Special Wall',
      moves: getBestMoves(pokemon, role),
      ability: preferredAbility?.name || 'Unknown',
      item: items.wall[0],
      nature: isPhysicalWall ? natures.defensive[1] : natures.defensive[2], // Impish or Calm
      evs: {
        hp: 252,
        attack: 0,
        defense: isPhysicalWall ? 252 : 4,
        specialAttack: 0,
        specialDefense: isPhysicalWall ? 4 : 252,
        speed: 0
      },
      description: `Defensive wall specialized in tanking ${isPhysicalWall ? 'physical' : 'special'} attacks`
    });
  } else if (role === 'tank') {
    movesets.push({
      role: 'Bulky Attacker',
      moves: getBestMoves(pokemon, 'tank'),
      ability: preferredAbility?.name || 'Unknown',
      item: items.tank[0],
      nature: isPhysical ? natures.physical[0] : natures.special[0],
      evs: {
        hp: 252,
        attack: isPhysical ? 252 : 0,
        defense: 0,
        specialAttack: isPhysical ? 0 : 252,
        specialDefense: 4,
        speed: 0
      },
      description: 'Bulky attacker that can take hits while dealing damage'
    });
  } else {
    movesets.push({
      role: 'Support',
      moves: getBestMoves(pokemon, 'support'),
      ability: preferredAbility?.name || 'Unknown',
      item: items.support[0],
      nature: natures.defensive[0],
      evs: {
        hp: 252,
        attack: 0,
        defense: 252,
        specialAttack: 0,
        specialDefense: 4,
        speed: 0
      },
      description: 'Support Pokemon focused on utility and team support'
    });
  }

  // Add alternative set if Pokemon has diverse stats
  if (pokemon.stats.total >= 500 && Math.abs(pokemon.stats.attack - pokemon.stats.specialAttack) < 20) {
    movesets.push({
      role: 'Mixed Attacker',
      moves: getBestMoves(pokemon, 'sweeper'),
      ability: preferredAbility?.name || 'Unknown',
      item: 'Life Orb',
      nature: natures.mixed[0],
      evs: {
        hp: 0,
        attack: 128,
        defense: 0,
        specialAttack: 128,
        specialDefense: 0,
        speed: 252
      },
      description: 'Mixed attacker utilizing both physical and special moves'
    });
  }

  return movesets;
}

export function getRecommendedAbility(pokemon: Pokemon): { name: string; isHidden: boolean } {
  // Prefer non-hidden abilities for competitive play
  const regular = pokemon.abilities.filter(a => !a.isHidden);
  if (regular.length > 0) {
    return regular[0];
  }
  return pokemon.abilities[0] || { name: 'Unknown', isHidden: false };
}

// Get the signature moves for a Pokemon if they exist
export function getSignatureMoves(pokemonName: string): string[] | null {
  const name = pokemonName.toLowerCase();
  return signatureMoves[name] || null;
}
