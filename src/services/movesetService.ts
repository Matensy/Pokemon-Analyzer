import { Pokemon, Moveset } from '../types/pokemon';

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
  recovery: ['Recover', 'Roost', 'Slack Off', 'Moonlight', 'Morning Sun', 'Synthesis', 'Rest', 'Wish'],
  priority: ['Aqua Jet', 'Bullet Punch', 'Extreme Speed', 'Ice Shard', 'Mach Punch', 'Sucker Punch', 'Shadow Sneak'],
  setup: ['Swords Dance', 'Dragon Dance', 'Nasty Plot', 'Calm Mind', 'Bulk Up', 'Quiver Dance', 'Shell Smash'],
  hazards: ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'],
  removal: ['Rapid Spin', 'Defog'],
  status: ['Thunder Wave', 'Toxic', 'Will-O-Wisp', 'Spore', 'Sleep Powder'],
  utility: ['Protect', 'Substitute', 'U-turn', 'Volt Switch', 'Flip Turn', 'Teleport'],
  screen: ['Reflect', 'Light Screen', 'Aurora Veil']
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

function getBestMoves(pokemon: Pokemon, role: string, count: number = 4): string[] {
  const moves = pokemon.moves;
  const selected: string[] = [];

  const typeBasedMoves = moves.filter(m =>
    pokemon.types.includes(m.type) &&
    m.power &&
    m.power >= 70
  );

  const coverageMoves = moves.filter(m =>
    !pokemon.types.includes(m.type) &&
    m.power &&
    m.power >= 70
  );

  // Add STAB moves
  if (role === 'sweeper' || role === 'setup') {
    const physicalOrSpecial = pokemon.stats.attack > pokemon.stats.specialAttack ? 'physical' : 'special';
    const stab = typeBasedMoves.filter(m => m.category === physicalOrSpecial);

    if (stab.length > 0) {
      selected.push(stab[0].name);
    }
  }

  // Add setup move if setup sweeper
  if (role === 'setup') {
    const setupMove = moves.find(m => commonMoves.setup.includes(m.name));
    if (setupMove && !selected.includes(setupMove.name)) {
      selected.push(setupMove.name);
    }
  }

  // Add coverage
  if (selected.length < count) {
    const coverage = coverageMoves.slice(0, count - selected.length);
    coverage.forEach(m => {
      if (!selected.includes(m.name)) {
        selected.push(m.name);
      }
    });
  }

  // Add utility/recovery for tanks and walls
  if (role.includes('wall') || role === 'tank') {
    const recovery = moves.find(m => commonMoves.recovery.includes(m.name));
    if (recovery && selected.length < count) {
      selected.push(recovery.name);
    }
  }

  // Add priority for sweepers
  if (role === 'sweeper' && selected.length < count) {
    const priority = moves.find(m => commonMoves.priority.includes(m.name));
    if (priority) {
      selected.push(priority.name);
    }
  }

  // Fill remaining slots with best available moves
  while (selected.length < count && moves.length > 0) {
    const remaining = moves.filter(m => !selected.includes(m.name) && m.power);
    if (remaining.length === 0) break;

    const best = remaining.reduce((prev, curr) =>
      (curr.power || 0) > (prev.power || 0) ? curr : prev
    );

    selected.push(best.name);
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
      ability: preferredAbility.name,
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
      ability: preferredAbility.name,
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
      ability: preferredAbility.name,
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
      ability: preferredAbility.name,
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
      ability: preferredAbility.name,
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
      ability: preferredAbility.name,
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
  return pokemon.abilities[0];
}
