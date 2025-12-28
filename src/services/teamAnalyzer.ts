// AI Team Analyzer - Provides recommendations and team analysis
import { Pokemon, PokemonType } from '../types/pokemon';
import { VGC_USAGE_DATA } from '../data/vgcStats';
import { SMOGON_MOVESETS, SmogonMoveset, VGC_ROLES } from '../data/smogonSets';

// Type effectiveness chart
const TYPE_CHART: Record<PokemonType, { weakTo: PokemonType[]; resistsTo: PokemonType[]; immuneTo: PokemonType[] }> = {
  normal: { weakTo: ['fighting'], resistsTo: [], immuneTo: ['ghost'] },
  fire: { weakTo: ['water', 'ground', 'rock'], resistsTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immuneTo: [] },
  water: { weakTo: ['electric', 'grass'], resistsTo: ['fire', 'water', 'ice', 'steel'], immuneTo: [] },
  electric: { weakTo: ['ground'], resistsTo: ['electric', 'flying', 'steel'], immuneTo: [] },
  grass: { weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'], resistsTo: ['water', 'electric', 'grass', 'ground'], immuneTo: [] },
  ice: { weakTo: ['fire', 'fighting', 'rock', 'steel'], resistsTo: ['ice'], immuneTo: [] },
  fighting: { weakTo: ['flying', 'psychic', 'fairy'], resistsTo: ['bug', 'rock', 'dark'], immuneTo: [] },
  poison: { weakTo: ['ground', 'psychic'], resistsTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immuneTo: [] },
  ground: { weakTo: ['water', 'grass', 'ice'], resistsTo: ['poison', 'rock'], immuneTo: ['electric'] },
  flying: { weakTo: ['electric', 'ice', 'rock'], resistsTo: ['grass', 'fighting', 'bug'], immuneTo: ['ground'] },
  psychic: { weakTo: ['bug', 'ghost', 'dark'], resistsTo: ['fighting', 'psychic'], immuneTo: [] },
  bug: { weakTo: ['fire', 'flying', 'rock'], resistsTo: ['grass', 'fighting', 'ground'], immuneTo: [] },
  rock: { weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'], resistsTo: ['normal', 'fire', 'poison', 'flying'], immuneTo: [] },
  ghost: { weakTo: ['ghost', 'dark'], resistsTo: ['poison', 'bug'], immuneTo: ['normal', 'fighting'] },
  dragon: { weakTo: ['ice', 'dragon', 'fairy'], resistsTo: ['fire', 'water', 'electric', 'grass'], immuneTo: [] },
  dark: { weakTo: ['fighting', 'bug', 'fairy'], resistsTo: ['ghost', 'dark'], immuneTo: ['psychic'] },
  steel: { weakTo: ['fire', 'fighting', 'ground'], resistsTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immuneTo: ['poison'] },
  fairy: { weakTo: ['poison', 'steel'], resistsTo: ['fighting', 'bug', 'dark'], immuneTo: ['dragon'] },
};

// Team analysis result
export interface TeamAnalysis {
  score: number; // 0-100
  roles: { role: string; filled: boolean; pokemon?: string }[];
  typeWeaknesses: { type: PokemonType; count: number; coveredBy?: string }[];
  typeResistances: { type: PokemonType; count: number }[];
  missingElements: string[];
  strengths: string[];
  synergies: string[];
  recommendations: PokemonRecommendation[];
}

export interface PokemonRecommendation {
  pokemon: string;
  sprite: string;
  reason: string;
  roles: string[];
  priority: number;
  synergies: string[];
}

// Analyze team composition
export function analyzeTeam(team: Pokemon[]): TeamAnalysis {
  const roles = analyzeRoles(team);
  const typeWeaknesses = analyzeTypeWeaknesses(team);
  const typeResistances = analyzeTypeResistances(team);
  const missingElements = findMissingElements(team, roles, typeWeaknesses);
  const strengths = findStrengths(team, roles);
  const synergies = findSynergies(team);
  const recommendations = getRecommendations(team, roles, typeWeaknesses, missingElements);

  // Calculate overall score
  const roleScore = (roles.filter(r => r.filled).length / Math.min(roles.length, 4)) * 30;
  const weaknessScore = Math.max(0, 30 - typeWeaknesses.filter(w => w.count >= 3).length * 10);
  const synergyScore = Math.min(synergies.length * 5, 20);
  const coverageScore = Math.min(typeResistances.filter(r => r.count >= 2).length * 2, 20);

  const score = Math.min(100, Math.round(roleScore + weaknessScore + synergyScore + coverageScore));

  return {
    score,
    roles,
    typeWeaknesses,
    typeResistances,
    missingElements,
    strengths,
    synergies,
    recommendations
  };
}

// Analyze what roles are filled
function analyzeRoles(team: Pokemon[]): TeamAnalysis['roles'] {
  const roles = [
    { role: 'Speed Control', keywords: ['tailwind', 'trick room', 'icy wind', 'thunder wave', 'prankster'], filled: false, pokemon: '' },
    { role: 'Fake Out Support', keywords: ['incineroar', 'rillaboom', 'mienshao', 'persian'], filled: false, pokemon: '' },
    { role: 'Redirector', keywords: ['amoonguss', 'indeedee', 'togekiss', 'clefairy'], filled: false, pokemon: '' },
    { role: 'Physical Attacker', keywords: [], stat: 'attack', threshold: 120, filled: false, pokemon: '' },
    { role: 'Special Attacker', keywords: [], stat: 'specialAttack', threshold: 120, filled: false, pokemon: '' },
    { role: 'Defensive Pivot', keywords: [], stat: 'defense', threshold: 100, filled: false, pokemon: '' },
    { role: 'Weather Setter', keywords: ['drought', 'drizzle', 'sand stream', 'snow warning', 'orichalcum', 'hadron'], filled: false, pokemon: '' },
    { role: 'Terrain Setter', keywords: ['grassy surge', 'electric surge', 'psychic surge', 'misty surge'], filled: false, pokemon: '' },
  ];

  team.forEach(pokemon => {
    const name = pokemon.name.toLowerCase();
    const abilities = pokemon.abilities?.map(a => (typeof a === 'string' ? a : a.name).toLowerCase()) || [];

    roles.forEach(role => {
      if (role.filled) return;

      // Check by keywords
      if (role.keywords.some(k => name.includes(k) || abilities.some(a => a.includes(k)))) {
        role.filled = true;
        role.pokemon = pokemon.name;
      }

      // Check by stats
      if (role.stat && pokemon.stats) {
        const statValue = (pokemon.stats as any)[role.stat];
        if (statValue >= (role.threshold || 100)) {
          role.filled = true;
          role.pokemon = pokemon.name;
        }
      }
    });
  });

  return roles.map(r => ({ role: r.role, filled: r.filled, pokemon: r.pokemon || undefined }));
}

// Analyze type weaknesses
function analyzeTypeWeaknesses(team: Pokemon[]): TeamAnalysis['typeWeaknesses'] {
  const weaknesses: Record<PokemonType, { count: number; coveredBy?: string }> = {} as any;

  const allTypes: PokemonType[] = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

  allTypes.forEach(type => {
    weaknesses[type] = { count: 0 };
  });

  team.forEach(pokemon => {
    pokemon.types.forEach(pokemonType => {
      const typeData = TYPE_CHART[pokemonType];
      if (typeData) {
        typeData.weakTo.forEach(weak => {
          weaknesses[weak].count++;
        });
      }
    });
  });

  // Find coverage for weaknesses
  team.forEach(pokemon => {
    pokemon.types.forEach(pokemonType => {
      const typeData = TYPE_CHART[pokemonType];
      if (typeData) {
        typeData.resistsTo.forEach(resist => {
          if (weaknesses[resist] && weaknesses[resist].count > 0 && !weaknesses[resist].coveredBy) {
            weaknesses[resist].coveredBy = pokemon.name;
          }
        });
        typeData.immuneTo.forEach(immune => {
          if (weaknesses[immune] && !weaknesses[immune].coveredBy) {
            weaknesses[immune].coveredBy = pokemon.name;
          }
        });
      }
    });
  });

  return Object.entries(weaknesses)
    .filter(([, data]) => data.count > 0)
    .map(([type, data]) => ({
      type: type as PokemonType,
      count: data.count,
      coveredBy: data.coveredBy
    }))
    .sort((a, b) => b.count - a.count);
}

// Analyze type resistances
function analyzeTypeResistances(team: Pokemon[]): TeamAnalysis['typeResistances'] {
  const resistances: Record<PokemonType, number> = {} as any;

  const allTypes: PokemonType[] = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

  allTypes.forEach(type => {
    resistances[type] = 0;
  });

  team.forEach(pokemon => {
    pokemon.types.forEach(pokemonType => {
      const typeData = TYPE_CHART[pokemonType];
      if (typeData) {
        typeData.resistsTo.forEach(resist => {
          resistances[resist]++;
        });
        typeData.immuneTo.forEach(immune => {
          resistances[immune] += 2; // Immunities count more
        });
      }
    });
  });

  return Object.entries(resistances)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ type: type as PokemonType, count }))
    .sort((a, b) => b.count - a.count);
}

// Find missing elements
function findMissingElements(
  team: Pokemon[],
  roles: TeamAnalysis['roles'],
  weaknesses: TeamAnalysis['typeWeaknesses']
): string[] {
  const missing: string[] = [];

  // Check unfilled essential roles
  const essentialRoles = ['Speed Control', 'Fake Out Support', 'Physical Attacker', 'Special Attacker'];
  roles.filter(r => essentialRoles.includes(r.role) && !r.filled)
    .forEach(r => missing.push(`Missing ${r.role}`));

  // Check critical weaknesses (3+ Pokemon weak to same type)
  weaknesses.filter(w => w.count >= 3 && !w.coveredBy)
    .forEach(w => missing.push(`${w.count}x weakness to ${w.type.toUpperCase()} (no resist)`));

  // Check if team is too offensive or too defensive
  const physAttackers = team.filter(p => p.stats && p.stats.attack > 100).length;
  const specAttackers = team.filter(p => p.stats && p.stats.specialAttack > 100).length;

  if (physAttackers + specAttackers < 2 && team.length >= 3) {
    missing.push('Team lacks offensive presence');
  }

  if (team.length >= 4 && !roles.find(r => r.role === 'Speed Control')?.filled) {
    missing.push('No Speed Control (Tailwind/Trick Room)');
  }

  return missing;
}

// Find team strengths
function findStrengths(team: Pokemon[], roles: TeamAnalysis['roles']): string[] {
  const strengths: string[] = [];

  // Check filled roles
  const filledRoles = roles.filter(r => r.filled);
  if (filledRoles.length >= 3) {
    strengths.push(`Good role coverage (${filledRoles.length} roles filled)`);
  }

  // Check for popular VGC picks
  const vgcPicks = team.filter(p =>
    VGC_USAGE_DATA.some(v => v.pokemon.toLowerCase() === p.name.toLowerCase())
  );
  if (vgcPicks.length >= 2) {
    strengths.push(`${vgcPicks.length} top-tier VGC Pokemon`);
  }

  // Check stat totals
  const avgStats = team.reduce((sum, p) => sum + (p.stats?.total || 0), 0) / team.length;
  if (avgStats > 550) {
    strengths.push('High average base stats');
  }

  // Check for strong type combinations
  const hasFireWater = team.some(p => p.types.includes('fire')) && team.some(p => p.types.includes('water'));
  const hasFairySteel = team.some(p => p.types.includes('fairy')) && team.some(p => p.types.includes('steel'));

  if (hasFireWater) strengths.push('Fire + Water core (good coverage)');
  if (hasFairySteel) strengths.push('Fairy + Steel core (defensive synergy)');

  return strengths;
}

// Find team synergies
function findSynergies(team: Pokemon[]): string[] {
  const synergies: string[] = [];

  const names = team.map(p => p.name.toLowerCase());
  const types = team.flatMap(p => p.types);
  const abilities = team.flatMap(p => p.abilities?.map(a => typeof a === 'string' ? a : a.name).map(a => a.toLowerCase()) || []);

  // Weather synergies
  if (abilities.some(a => a.includes('drought') || a.includes('orichalcum'))) {
    if (types.includes('fire') || abilities.some(a => a.includes('chlorophyll') || a.includes('solar power'))) {
      synergies.push('Sun team synergy');
    }
  }

  if (abilities.some(a => a.includes('drizzle') || a.includes('hadron'))) {
    if (types.includes('water') || abilities.some(a => a.includes('swift swim') || a.includes('rain dish'))) {
      synergies.push('Rain team synergy');
    }
  }

  // Intimidate + redirect
  if (abilities.some(a => a.includes('intimidate')) && names.some(n => n.includes('amoonguss') || n.includes('indeedee'))) {
    synergies.push('Intimidate + Redirection combo');
  }

  // Grassy terrain + grassy glide
  if (abilities.some(a => a.includes('grassy surge'))) {
    synergies.push('Grassy Terrain priority attacks');
  }

  // Electric terrain
  if (abilities.some(a => a.includes('hadron') || a.includes('electric surge'))) {
    if (types.includes('electric')) {
      synergies.push('Electric Terrain boost synergy');
    }
  }

  // Fake Out support
  if (names.some(n => ['incineroar', 'rillaboom', 'mienshao'].includes(n))) {
    synergies.push('Fake Out pressure');
  }

  return synergies;
}

// Get AI recommendations
function getRecommendations(
  team: Pokemon[],
  roles: TeamAnalysis['roles'],
  weaknesses: TeamAnalysis['typeWeaknesses'],
  missing: string[]
): PokemonRecommendation[] {
  const recommendations: PokemonRecommendation[] = [];
  const teamNames = team.map(p => p.name.toLowerCase());

  // Recommend based on missing roles
  const unfilledRoles = roles.filter(r => !r.filled);

  // Speed Control recommendations
  if (unfilledRoles.some(r => r.role === 'Speed Control')) {
    if (!teamNames.includes('tornadus')) {
      recommendations.push({
        pokemon: 'Tornadus',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/641.png',
        reason: 'Priority Tailwind with Prankster',
        roles: ['Speed Control', 'Offensive Support'],
        priority: 10,
        synergies: ['Sets Tailwind turn 1', 'Bleakwind Storm for spread damage']
      });
    }
    if (!teamNames.includes('whimsicott')) {
      recommendations.push({
        pokemon: 'Whimsicott',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/547.png',
        reason: 'Priority Tailwind and Taunt support',
        roles: ['Speed Control', 'Utility'],
        priority: 9,
        synergies: ['Encore disruption', 'Moonblast coverage']
      });
    }
  }

  // Fake Out Support
  if (unfilledRoles.some(r => r.role === 'Fake Out Support')) {
    if (!teamNames.includes('incineroar')) {
      recommendations.push({
        pokemon: 'Incineroar',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/727.png',
        reason: 'Best support in VGC - Fake Out + Intimidate',
        roles: ['Fake Out Support', 'Defensive Pivot'],
        priority: 10,
        synergies: ['Parting Shot pivoting', 'Knock Off utility']
      });
    }
    if (!teamNames.includes('rillaboom')) {
      recommendations.push({
        pokemon: 'Rillaboom',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/812.png',
        reason: 'Fake Out + Priority Grassy Glide',
        roles: ['Fake Out Support', 'Physical Attacker', 'Terrain Setter'],
        priority: 9,
        synergies: ['Grassy Terrain healing', 'U-turn pivoting']
      });
    }
  }

  // Redirector
  if (unfilledRoles.some(r => r.role === 'Redirector')) {
    if (!teamNames.includes('amoonguss')) {
      recommendations.push({
        pokemon: 'Amoonguss',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/591.png',
        reason: 'Rage Powder redirection + Spore',
        roles: ['Redirector', 'Defensive Pivot'],
        priority: 9,
        synergies: ['Regenerator healing', 'Clear Smog anti-setup']
      });
    }
  }

  // Cover critical weaknesses
  const criticalWeaknesses = weaknesses.filter(w => w.count >= 3 && !w.coveredBy);
  criticalWeaknesses.forEach(weakness => {
    const resistPokemon = getResistRecommendation(weakness.type, teamNames);
    if (resistPokemon) {
      recommendations.push(resistPokemon);
    }
  });

  // Add top VGC picks not on team
  VGC_USAGE_DATA.slice(0, 15).forEach(vgcData => {
    const pokemonName = vgcData.pokemon.toLowerCase();
    if (!teamNames.includes(pokemonName) && recommendations.length < 10) {
      const existing = recommendations.find(r => r.pokemon.toLowerCase() === pokemonName);
      if (!existing) {
        recommendations.push({
          pokemon: vgcData.pokemon,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(pokemonName)}.png`,
          reason: `Top ${vgcData.usagePercent}% usage in VGC`,
          roles: vgcData.commonMoves?.slice(0, 2) || ['Meta Pick'],
          priority: Math.round(vgcData.usagePercent / 10),
          synergies: vgcData.commonMoves?.slice(0, 3) || []
        });
      }
    }
  });

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 8);
}

// Get Pokemon that resists a type
function getResistRecommendation(weakType: PokemonType, teamNames: string[]): PokemonRecommendation | null {
  const resistSuggestions: Record<PokemonType, { name: string; id: number; roles: string[] }[]> = {
    ground: [
      { name: 'Flutter Mane', id: 987, roles: ['Special Attacker', 'Speed Demon'] },
      { name: 'Tornadus', id: 641, roles: ['Speed Control'] },
    ],
    ice: [
      { name: 'Incineroar', id: 727, roles: ['Fake Out Support', 'Tank'] },
      { name: 'Arcanine', id: 59, roles: ['Intimidate', 'Attacker'] },
    ],
    fairy: [
      { name: 'Gholdengo', id: 1000, roles: ['Special Attacker', 'Status Immunity'] },
      { name: 'Incineroar', id: 727, roles: ['Support'] },
    ],
    water: [
      { name: 'Rillaboom', id: 812, roles: ['Fake Out', 'Grass Attacker'] },
      { name: 'Gastrodon', id: 423, roles: ['Special Tank', 'Storm Drain'] },
    ],
    electric: [
      { name: 'Great Tusk', id: 984, roles: ['Physical Attacker', 'Ground Coverage'] },
      { name: 'Landorus', id: 645, roles: ['Intimidate', 'Ground Coverage'] },
    ],
    fire: [
      { name: 'Incineroar', id: 727, roles: ['Support'] },
      { name: 'Arcanine', id: 59, roles: ['Intimidate'] },
    ],
    fighting: [
      { name: 'Flutter Mane', id: 987, roles: ['Special Attacker'] },
      { name: 'Tornadus', id: 641, roles: ['Speed Control'] },
    ],
    dark: [
      { name: 'Iron Hands', id: 992, roles: ['Physical Tank', 'Fake Out'] },
      { name: 'Iron Valiant', id: 1006, roles: ['Mixed Attacker'] },
    ],
    dragon: [
      { name: 'Flutter Mane', id: 987, roles: ['Fairy Attacker'] },
      { name: 'Dachsbun', id: 927, roles: ['Fairy Support'] },
    ],
    ghost: [
      { name: 'Incineroar', id: 727, roles: ['Dark Coverage'] },
      { name: 'Kingambit', id: 983, roles: ['Dark Attacker'] },
    ],
    psychic: [
      { name: 'Kingambit', id: 983, roles: ['Dark Attacker'] },
      { name: 'Gholdengo', id: 1000, roles: ['Steel Type'] },
    ],
    steel: [
      { name: 'Incineroar', id: 727, roles: ['Fire Coverage'] },
      { name: 'Arcanine', id: 59, roles: ['Fire Attacker'] },
    ],
    normal: [],
    poison: [],
    bug: [],
    rock: [],
    flying: [],
    grass: [],
  };

  const suggestions = resistSuggestions[weakType] || [];
  const available = suggestions.find(s => !teamNames.includes(s.name.toLowerCase()));

  if (available) {
    return {
      pokemon: available.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${available.id}.png`,
      reason: `Resists ${weakType.toUpperCase()} (team has ${weakType} weakness)`,
      roles: available.roles,
      priority: 8,
      synergies: [`Covers ${weakType} weakness`]
    };
  }

  return null;
}

// Helper to get Pokemon ID for sprite
function getPokemonId(name: string): number {
  const pokemonIds: Record<string, number> = {
    'koraidon': 1007, 'miraidon': 1008, 'flutter mane': 987, 'iron hands': 992,
    'incineroar': 727, 'rillaboom': 812, 'amoonguss': 591, 'gholdengo': 1000,
    'tornadus': 641, 'chien-pao': 1002, 'calyrex-shadow': 898, 'calyrex-ice': 898,
    'iron valiant': 1006, 'great tusk': 984, 'chi-yu': 1004, 'ting-lu': 1003,
    'kingambit': 983, 'dragapult': 887, 'urshifu': 892, 'landorus': 645,
    'whimsicott': 547, 'grimmsnarl': 861, 'indeedee-f': 876, 'arcanine': 59,
    'gastrodon': 423, 'cresselia': 488, 'archaludon': 1018, 'walking wake': 1009,
  };
  return pokemonIds[name.toLowerCase()] || 1;
}

// Auto-fill team with AI recommendations
export function autoFillTeam(currentTeam: Pokemon[], targetSize: number = 6): string[] {
  const analysis = analyzeTeam(currentTeam);
  const teamNames = currentTeam.map(p => p.name.toLowerCase());
  const suggestions: string[] = [];

  // Priority 1: Fill missing roles
  const missingRoles = analysis.roles.filter(r => !r.filled);

  // Add recommendations based on priority
  const sortedRecommendations = analysis.recommendations.sort((a, b) => b.priority - a.priority);

  for (const rec of sortedRecommendations) {
    if (suggestions.length >= targetSize - currentTeam.length) break;
    if (!teamNames.includes(rec.pokemon.toLowerCase()) && !suggestions.includes(rec.pokemon)) {
      suggestions.push(rec.pokemon);
    }
  }

  // Fill remaining slots with top VGC picks
  const topPicks = VGC_USAGE_DATA.map(v => v.pokemon);
  for (const pick of topPicks) {
    if (suggestions.length >= targetSize - currentTeam.length) break;
    if (!teamNames.includes(pick.toLowerCase()) && !suggestions.includes(pick)) {
      suggestions.push(pick);
    }
  }

  return suggestions.slice(0, targetSize - currentTeam.length);
}

// Get best moveset for a Pokemon
export function getBestMoveset(pokemonName: string, format: string = 'vgc2025'): SmogonMoveset | null {
  const movesets = SMOGON_MOVESETS.filter(
    m => m.pokemon.toLowerCase() === pokemonName.toLowerCase() && m.format === format
  ).sort((a, b) => b.usage - a.usage);

  return movesets[0] || null;
}
