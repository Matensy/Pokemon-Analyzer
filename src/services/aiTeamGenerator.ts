import { Pokemon, PokemonType } from '../types/pokemon';
import { BattlePokemon, TeamSynergyScore, MEGA_POKEMON } from '../types/battle';
import { getRandomBerry, getRandomHeldItem } from '../data/items';
import { fetchPokemon, fetchPokemonByGeneration } from './pokeapi';
import { generateMovesets } from './movesetService';

// AI Team Generator - Creates diverse, synergistic teams

const TEAM_ARCHETYPES = [
  'hyper-offense',
  'balanced',
  'stall',
  'weather',
  'trick-room',
  'setup-sweep',
  'hazard-stack',
  'volt-turn'
] as const;

type TeamArchetype = typeof TEAM_ARCHETYPES[number];

interface TeamTemplate {
  archetype: TeamArchetype;
  roles: string[];
  preferredTypes: PokemonType[];
  minSpeed: number;
  maxSpeed: number;
  strategy: string;
}

const TEAM_TEMPLATES: Record<TeamArchetype, TeamTemplate> = {
  'hyper-offense': {
    archetype: 'hyper-offense',
    roles: ['sweeper', 'sweeper', 'sweeper', 'setup', 'revenge-killer', 'wallbreaker'],
    preferredTypes: ['dragon', 'fighting', 'fire', 'electric'],
    minSpeed: 90,
    maxSpeed: 200,
    strategy: 'Overwhelm opponent with fast, hard-hitting attackers'
  },
  'balanced': {
    archetype: 'balanced',
    roles: ['sweeper', 'wall', 'pivot', 'wallbreaker', 'support', 'revenge-killer'],
    preferredTypes: ['water', 'steel', 'fairy', 'ground'],
    minSpeed: 50,
    maxSpeed: 150,
    strategy: 'Versatile team with offensive and defensive options'
  },
  'stall': {
    archetype: 'stall',
    roles: ['wall', 'wall', 'wall', 'cleric', 'toxic-staller', 'phazer'],
    preferredTypes: ['steel', 'fairy', 'water', 'poison'],
    minSpeed: 20,
    maxSpeed: 80,
    strategy: 'Wear down opponent with passive damage and walls'
  },
  'weather': {
    archetype: 'weather',
    roles: ['weather-setter', 'weather-sweeper', 'weather-sweeper', 'pivot', 'wall', 'support'],
    preferredTypes: ['water', 'rock', 'ground', 'grass'],
    minSpeed: 60,
    maxSpeed: 180,
    strategy: 'Abuse weather conditions for advantage'
  },
  'trick-room': {
    archetype: 'trick-room',
    roles: ['trick-room-setter', 'slow-attacker', 'slow-attacker', 'slow-attacker', 'wall', 'support'],
    preferredTypes: ['psychic', 'steel', 'ghost', 'fighting'],
    minSpeed: 0,
    maxSpeed: 60,
    strategy: 'Reverse speed tiers with Trick Room'
  },
  'setup-sweep': {
    archetype: 'setup-sweep',
    roles: ['setup', 'setup', 'setup', 'wallbreaker', 'pivot', 'support'],
    preferredTypes: ['dragon', 'dark', 'fighting', 'bug'],
    minSpeed: 70,
    maxSpeed: 180,
    strategy: 'Boost stats and sweep'
  },
  'hazard-stack': {
    archetype: 'hazard-stack',
    roles: ['hazard-setter', 'hazard-setter', 'spinner-blocker', 'wallbreaker', 'wall', 'revenge-killer'],
    preferredTypes: ['rock', 'steel', 'ghost', 'poison'],
    minSpeed: 40,
    maxSpeed: 130,
    strategy: 'Stack entry hazards and pressure opponent'
  },
  'volt-turn': {
    archetype: 'volt-turn',
    roles: ['pivot', 'pivot', 'pivot', 'wallbreaker', 'sweeper', 'support'],
    preferredTypes: ['electric', 'bug', 'water', 'fire'],
    minSpeed: 80,
    maxSpeed: 160,
    strategy: 'Maintain momentum with pivoting moves'
  }
};

// Track used teams to ensure variety
const usedTeamHashes = new Set<string>();

function getTeamHash(team: Pokemon[]): string {
  return team.map(p => p.id).sort().join('-');
}

export async function generateAITeam(playerTeam?: Pokemon[]): Promise<BattlePokemon[]> {
  // 99% chance of unique team
  let attempts = 0;
  let team: Pokemon[];
  let teamHash: string;

  do {
    // Random archetype (or counter player's team if provided)
    const archetype = playerTeam
      ? selectCounterArchetype(playerTeam)
      : TEAM_ARCHETYPES[Math.floor(Math.random() * TEAM_ARCHETYPES.length)];

    team = await buildTeamFromTemplate(TEAM_TEMPLATES[archetype]);
    teamHash = getTeamHash(team);
    attempts++;

    // 1% chance to allow repeat after 100 attempts
    if (attempts > 100) break;
  } while (usedTeamHashes.has(teamHash));

  usedTeamHashes.add(teamHash);

  // Convert to BattlePokemon
  return team.map(pokemon => createBattlePokemon(pokemon));
}

function selectCounterArchetype(playerTeam: Pokemon[]): TeamArchetype {
  const avgSpeed = playerTeam.reduce((sum, p) => sum + p.stats.speed, 0) / playerTeam.length;
  const hasWalls = playerTeam.some(p => (p.stats.defense + p.stats.specialDefense) >= 180);

  if (avgSpeed > 100) {
    return Math.random() > 0.5 ? 'trick-room' : 'stall';
  } else if (hasWalls) {
    return Math.random() > 0.5 ? 'setup-sweep' : 'hyper-offense';
  } else {
    return TEAM_ARCHETYPES[Math.floor(Math.random() * TEAM_ARCHETYPES.length)];
  }
}

async function buildTeamFromTemplate(template: TeamTemplate): Promise<Pokemon[]> {
  const team: Pokemon[] = [];
  const usedIds = new Set<number>();

  // Get random generation (weighted towards recent gens)
  const genWeights = [5, 5, 10, 10, 15, 15, 20, 30, 40]; // Gen 1-9
  const randomGen = weightedRandom(genWeights) + 1;

  // Fetch pokemon pool from generation
  const genPokemon = await fetchPokemonByGeneration(randomGen as any);
  const pokemonPool: Pokemon[] = [];

  // Load a subset for performance
  const sampled = genPokemon.slice(0, 100);
  for (const id of sampled) {
    try {
      const p = await fetchPokemon(id);
      p.recommendedMovesets = generateMovesets(p);
      pokemonPool.push(p);
    } catch (e) {
      continue;
    }
  }

  // Build team
  for (let i = 0; i < 6; i++) {
    const role = template.roles[i];
    const candidates = pokemonPool.filter(p =>
      !usedIds.has(p.id) &&
      p.stats.speed >= template.minSpeed &&
      p.stats.speed <= template.maxSpeed &&
      (template.preferredTypes.length === 0 || p.types.some(t => template.preferredTypes.includes(t)))
    );

    if (candidates.length === 0) {
      // Fallback to any unused pokemon
      const fallback = pokemonPool.find(p => !usedIds.has(p.id));
      if (fallback) {
        team.push(fallback);
        usedIds.add(fallback.id);
      }
      continue;
    }

    // Select pokemon based on role
    const selected = selectPokemonForRole(candidates, role, team);
    team.push(selected);
    usedIds.add(selected.id);
  }

  return team;
}

function selectPokemonForRole(candidates: Pokemon[], role: string, currentTeam: Pokemon[]): Pokemon {
  // Score candidates
  const scored = candidates.map(p => ({
    pokemon: p,
    score: scorePokemonForRole(p, role, currentTeam)
  }));

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  // Pick from top 5 with some randomness
  const topCandidates = scored.slice(0, Math.min(5, scored.length));
  const weights = topCandidates.map((_, i) => 10 - i * 2);
  const selectedIndex = weightedRandom(weights);

  return topCandidates[selectedIndex].pokemon;
}

function scorePokemonForRole(pokemon: Pokemon, role: string, team: Pokemon[]): number {
  let score = 0;

  // Base stat total
  score += pokemon.stats.total / 10;

  // Role-specific scoring
  if (role === 'sweeper' || role === 'revenge-killer') {
    score += pokemon.stats.speed;
    score += Math.max(pokemon.stats.attack, pokemon.stats.specialAttack) / 2;
  } else if (role === 'wall') {
    score += (pokemon.stats.defense + pokemon.stats.specialDefense) / 2;
    score += pokemon.stats.hp / 2;
  } else if (role === 'setup') {
    score += Math.max(pokemon.stats.attack, pokemon.stats.specialAttack) / 2;
    score += pokemon.stats.speed / 2;
  } else if (role === 'support') {
    score += (pokemon.stats.defense + pokemon.stats.specialDefense) / 3;
    score += pokemon.stats.speed / 3;
  }

  // Type diversity bonus
  const teamTypes = team.flatMap(p => p.types);
  const hasUniqueType = pokemon.types.some(t => !teamTypes.includes(t));
  if (hasUniqueType) score += 20;

  // Avoid duplicate types penalty
  const duplicateTypes = pokemon.types.filter(t => teamTypes.includes(t)).length;
  score -= duplicateTypes * 10;

  return score;
}

function createBattlePokemon(pokemon: Pokemon): BattlePokemon {
  const level = 50; // VGC standard level
  const maxHp = Math.floor(((2 * pokemon.stats.hp + 31 + 63) * level) / 100) + level + 10;

  // Assign random held item
  const heldItem = Math.random() > 0.3 ? getRandomHeldItem() : getRandomBerry();

  // Check if can Mega Evolve
  const canMegaEvolve = MEGA_POKEMON[pokemon.name.toLowerCase()] !== undefined;

  // Select 4 random moves from movepool
  const availableMoves = pokemon.moves.filter(m => m.power && m.power > 0);
  const selectedMoves = [];

  if (availableMoves.length > 0) {
    // Ensure type coverage
    const stab = availableMoves.filter(m => pokemon.types.includes(m.type));
    const coverage = availableMoves.filter(m => !pokemon.types.includes(m.type));

    // Add 2 STAB moves
    for (let i = 0; i < Math.min(2, stab.length); i++) {
      selectedMoves.push(stab[Math.floor(Math.random() * stab.length)]);
    }

    // Add 2 coverage moves
    while (selectedMoves.length < 4 && coverage.length > 0) {
      const move = coverage.splice(Math.floor(Math.random() * coverage.length), 1)[0];
      selectedMoves.push(move);
    }

    // Fill remaining with any moves
    while (selectedMoves.length < 4 && availableMoves.length > 0) {
      const move = availableMoves.splice(Math.floor(Math.random() * availableMoves.length), 1)[0];
      if (!selectedMoves.includes(move)) {
        selectedMoves.push(move);
      }
    }
  }

  return {
    ...pokemon,
    currentHp: maxHp,
    maxHp,
    level,
    status: { name: null },
    statStages: {
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
      accuracy: 0,
      evasion: 0
    },
    heldItem,
    selectedMoves,
    isActive: false,
    isFainted: false,
    // New mechanics
    canMegaEvolve,
    megaState: { isMega: false },
    dynamaxState: { isDynamaxed: false, turnsRemaining: 0 },
    teraState: { isTerastallized: false, teraType: null },
    // VGC specific fields
    activeAbility: typeof pokemon.abilities?.[0] === 'string' ? pokemon.abilities[0] : pokemon.abilities?.[0]?.name || 'unknown',
    abilityActivated: false,
    isGrounded: !pokemon.types.includes('flying'),
    hasSubstitute: false,
    substituteHp: 0,
    protectCount: 0,
    position: 0
  };
}

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }

  return weights.length - 1;
}

export function calculateTeamSynergy(team: Pokemon[]): TeamSynergyScore {
  let offensiveCoverage = 0;
  let defensiveSynergy = 0;
  let speedTiers = 0;
  let roleBalance = 0;

  // Offensive coverage (simplified)
  const coveredTypes = new Set<PokemonType>();
  team.forEach(p => p.types.forEach(t => coveredTypes.add(t)));
  offensiveCoverage = (coveredTypes.size / 18) * 100;

  // Defensive synergy
  const typeCount: Record<string, number> = {};
  team.forEach(p => {
    p.types.forEach(t => {
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
  });
  const uniqueness = Object.values(typeCount).filter(count => count === 1).length;
  defensiveSynergy = (uniqueness / 12) * 100;

  // Speed tiers
  const speeds = team.map(p => p.stats.speed).sort((a, b) => b - a);
  const hasSpeedVariety = speeds[0] - speeds[speeds.length - 1] > 80;
  speedTiers = hasSpeedVariety ? 80 : 50;

  // Role balance
  const sweepers = team.filter(p => p.stats.speed >= 90).length;
  const walls = team.filter(p => (p.stats.defense + p.stats.specialDefense) >= 180).length;
  const balanced = Math.abs(sweepers - walls) <= 2;
  roleBalance = balanced ? 90 : 60;

  const overall = (offensiveCoverage + defensiveSynergy + speedTiers + roleBalance) / 4;

  return {
    overall,
    offensiveCoverage,
    defensiveSynergy,
    speedTiers,
    roleBalance
  };
}
