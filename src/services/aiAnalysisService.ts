import { Pokemon, TeamAnalysis, PokemonType } from '../types/pokemon';

const allTypes: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Comprehensive type chart for offensive coverage
const offensiveChart: Record<PokemonType, PokemonType[]> = {
  normal: [],
  fire: ['grass', 'ice', 'bug', 'steel'],
  water: ['fire', 'ground', 'rock'],
  electric: ['water', 'flying'],
  grass: ['water', 'ground', 'rock'],
  ice: ['grass', 'ground', 'flying', 'dragon'],
  fighting: ['normal', 'ice', 'rock', 'dark', 'steel'],
  poison: ['grass', 'fairy'],
  ground: ['fire', 'electric', 'poison', 'rock', 'steel'],
  flying: ['grass', 'fighting', 'bug'],
  psychic: ['fighting', 'poison'],
  bug: ['grass', 'psychic', 'dark'],
  rock: ['fire', 'ice', 'flying', 'bug'],
  ghost: ['psychic', 'ghost'],
  dragon: ['dragon'],
  dark: ['psychic', 'ghost'],
  steel: ['ice', 'rock', 'fairy'],
  fairy: ['fighting', 'dragon', 'dark']
};

// Meta threats - common competitive Pokemon that need to be handled
const metaThreats = {
  'Landorus-Therian': { types: ['ground', 'flying' as PokemonType], threat: 'Intimidate + Ground/Flying STAB' },
  'Dragapult': { types: ['dragon', 'ghost' as PokemonType], threat: 'High Speed + Strong Special Attacks' },
  'Rillaboom': { types: ['grass' as PokemonType], threat: 'Grassy Surge + Priority' },
  'Urshifu': { types: ['fighting', 'dark' as PokemonType], threat: 'Unseen Fist + Guaranteed Crits' },
  'Garchomp': { types: ['dragon', 'ground' as PokemonType], threat: 'High Speed + Mixed Offense' },
  'Toxapex': { types: ['poison', 'water' as PokemonType], threat: 'Regenerator + Extreme Bulk' },
  'Ferrothorn': { types: ['grass', 'steel' as PokemonType], threat: 'Iron Barbs + Hazard Setting' },
  'Tyranitar': { types: ['rock', 'dark' as PokemonType], threat: 'Sand Stream + High Bulk' },
  'Blaziken': { types: ['fire', 'fighting' as PokemonType], threat: 'Speed Boost + Mixed Offense' },
  'Alakazam': { types: ['psychic' as PokemonType], threat: 'Extreme Special Attack + Speed' }
};

export function analyzeTeam(team: Pokemon[]): TeamAnalysis {
  if (team.length === 0) {
    return getEmptyAnalysis();
  }

  // Calculate offensive coverage
  const offensiveCoverage = calculateOffensiveCoverage(team);

  // Calculate defensive coverage
  const defensiveCoverage = calculateDefensiveCoverage(team);

  // Find weaknesses
  const weaknesses = findTeamWeaknesses(team);

  // Find strengths
  const strengths = findTeamStrengths(team);

  // Calculate synergies
  const synergies = calculateSynergies(team);

  // Identify threats
  const threats = identifyThreats(team);

  // Generate AI recommendations
  const recommendations = generateRecommendations(team, weaknesses, offensiveCoverage, defensiveCoverage);

  // Calculate overall score
  const overallScore = calculateOverallScore(team, weaknesses, offensiveCoverage, synergies);

  return {
    overallScore,
    typecoverage: {
      offensive: offensiveCoverage,
      defensive: defensiveCoverage
    },
    weaknesses,
    strengths,
    synergies,
    threats,
    recommendations
  };
}

function calculateOffensiveCoverage(team: Pokemon[]): Record<PokemonType, number> {
  const coverage: Record<PokemonType, number> = {} as any;
  allTypes.forEach(type => coverage[type] = 0);

  team.forEach(pokemon => {
    pokemon.types.forEach(type => {
      const superEffectiveAgainst = offensiveChart[type];
      superEffectiveAgainst.forEach(targetType => {
        coverage[targetType]++;
      });
    });

    // Also count coverage moves
    pokemon.moves.forEach(move => {
      if (move.power && move.power > 60) {
        const superEffectiveAgainst = offensiveChart[move.type] || [];
        superEffectiveAgainst.forEach(targetType => {
          coverage[targetType] += 0.5;
        });
      }
    });
  });

  return coverage;
}

function calculateDefensiveCoverage(team: Pokemon[]): Record<PokemonType, number> {
  const coverage: Record<PokemonType, number> = {} as any;
  allTypes.forEach(type => coverage[type] = 0);

  team.forEach(pokemon => {
    const effectiveness = pokemon.typeEffectiveness;

    // Count resistances as positive
    effectiveness.resistantTo.forEach(type => {
      coverage[type] += 1;
    });

    effectiveness.immune.forEach(type => {
      coverage[type] += 2;
    });

    // Count weaknesses as negative
    effectiveness.weakTo.forEach(type => {
      coverage[type] -= 1;
    });

    effectiveness.doubleWeakTo.forEach(type => {
      coverage[type] -= 2;
    });
  });

  return coverage;
}

function findTeamWeaknesses(team: Pokemon[]) {
  const weaknessCounts: Record<string, { count: number; pokemon: string[] }> = {};

  team.forEach(pokemon => {
    const allWeaknesses = [
      ...pokemon.typeEffectiveness.weakTo,
      ...pokemon.typeEffectiveness.doubleWeakTo
    ];

    allWeaknesses.forEach(type => {
      if (!weaknessCounts[type]) {
        weaknessCounts[type] = { count: 0, pokemon: [] };
      }
      weaknessCounts[type].count++;
      weaknessCounts[type].pokemon.push(pokemon.name);
    });
  });

  return Object.entries(weaknessCounts)
    .filter(([_, data]) => data.count >= 3) // Only show if 3+ Pokemon are weak
    .map(([type, data]) => ({
      type: type as PokemonType,
      count: data.count,
      affectedPokemon: data.pokemon
    }))
    .sort((a, b) => b.count - a.count);
}

function findTeamStrengths(team: Pokemon[]): PokemonType[] {
  const resistCounts: Record<string, number> = {};

  team.forEach(pokemon => {
    pokemon.typeEffectiveness.resistantTo.forEach(type => {
      resistCounts[type] = (resistCounts[type] || 0) + 1;
    });
    pokemon.typeEffectiveness.immune.forEach(type => {
      resistCounts[type] = (resistCounts[type] || 0) + 2;
    });
  });

  return Object.entries(resistCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type as PokemonType);
}

function calculateSynergies(team: Pokemon[]) {
  const synergies: any[] = [];

  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      const p1 = team[i];
      const p2 = team[j];

      // Check defensive synergy
      const p1WeakTypes = [...p1.typeEffectiveness.weakTo, ...p1.typeEffectiveness.doubleWeakTo];
      const p2ResistTypes = [...p2.typeEffectiveness.resistantTo, ...p2.typeEffectiveness.immune];

      const defensiveSynergy = p1WeakTypes.filter(type => p2ResistTypes.includes(type)).length;

      // Check offensive synergy
      const hasSpeedTier = Math.abs(p1.stats.speed - p2.stats.speed) > 30;
      const hasRoleBalance = (p1.stats.attack > p1.stats.specialAttack) !== (p2.stats.attack > p2.stats.specialAttack);

      const score = defensiveSynergy * 20 + (hasSpeedTier ? 15 : 0) + (hasRoleBalance ? 10 : 0);

      if (score >= 30) {
        let description = '';
        if (defensiveSynergy > 0) {
          description += `${p2.name} covers ${p1.name}'s weaknesses. `;
        }
        if (hasSpeedTier) {
          description += `Good speed tier distribution. `;
        }
        if (hasRoleBalance) {
          description += `Balanced physical/special offense.`;
        }

        synergies.push({
          pokemon1: p1.name,
          pokemon2: p2.name,
          description: description.trim(),
          score
        });
      }
    }
  }

  return synergies.sort((a, b) => b.score - a.score);
}

function identifyThreats(team: Pokemon[]) {
  const threats: any[] = [];

  // Check each meta threat
  Object.entries(metaThreats).forEach(([name, data]) => {
    let threatLevel = 0;
    const vulnerablePokemon: string[] = [];

    team.forEach(pokemon => {
      // Check if this Pokemon is weak to the threat
      data.types.forEach(type => {
        const moveTypes = offensiveChart[type];
        moveTypes.forEach(effectiveType => {
          if (pokemon.types.includes(effectiveType)) {
            threatLevel++;
            if (!vulnerablePokemon.includes(pokemon.name)) {
              vulnerablePokemon.push(pokemon.name);
            }
          }
        });
      });
    });

    if (threatLevel >= 3) {
      threats.push({
        pokemon: name,
        reason: `${data.threat}. ${vulnerablePokemon.length} of your Pokemon are vulnerable.`,
        severity: threatLevel >= 5 ? 'critical' : threatLevel >= 4 ? 'high' : 'medium'
      });
    }
  });

  return threats;
}

function generateRecommendations(
  team: Pokemon[],
  weaknesses: any[],
  offensiveCoverage: Record<PokemonType, number>,
  defensiveCoverage: Record<PokemonType, number>
): any[] {
  const recommendations: any[] = [];

  // Check for major weaknesses
  weaknesses.forEach(weakness => {
    if (weakness.count >= 4) {
      recommendations.push({
        type: 'warning',
        message: `CRITICAL: Your team is extremely weak to ${weakness.type} type moves (${weakness.count} Pokemon affected). Consider swapping one Pokemon.`,
        priority: 'high'
      });
    } else if (weakness.count >= 3) {
      recommendations.push({
        type: 'warning',
        message: `Your team has a shared weakness to ${weakness.type} type. Be cautious of ${weakness.type} type threats.`,
        priority: 'medium'
      });
    }
  });

  // Check offensive coverage gaps
  const poorCoverage = Object.entries(offensiveCoverage)
    .filter(([_, count]) => count === 0)
    .map(([type]) => type);

  if (poorCoverage.length >= 6) {
    recommendations.push({
      type: 'add',
      message: `Your team lacks offensive coverage against ${poorCoverage.slice(0, 3).join(', ')} types. Consider adding moves or Pokemon with better type coverage.`,
      priority: 'medium'
    });
  }

  // Check defensive gaps
  const defensiveGaps = Object.entries(defensiveCoverage)
    .filter(([_, count]) => count <= -3)
    .map(([type]) => type);

  if (defensiveGaps.length > 0) {
    recommendations.push({
      type: 'swap',
      message: `Your team struggles defensively against ${defensiveGaps.join(', ')} types. Consider adding a resist or immune Pokemon.`,
      priority: 'high'
    });
  }

  // Check speed tiers
  const speeds = team.map(p => p.stats.speed).sort((a, b) => b - a);
  const hasFastMon = speeds[0] >= 100;
  const hasSlowMon = speeds[speeds.length - 1] <= 60;

  if (!hasFastMon) {
    recommendations.push({
      type: 'add',
      message: 'Consider adding a fast Pokemon (100+ Speed) to outspeed common threats.',
      priority: 'medium'
    });
  }

  if (team.length >= 4 && !hasSlowMon) {
    recommendations.push({
      type: 'moveset',
      message: 'Your team lacks Trick Room support. Consider adding priority moves or a slow bulky Pokemon.',
      priority: 'low'
    });
  }

  // Check role balance
  const roles = team.map(p => {
    const isSweeper = p.stats.speed >= 90 && (p.stats.attack >= 100 || p.stats.specialAttack >= 100);
    const isWall = (p.stats.defense + p.stats.specialDefense) >= 180;
    return isSweeper ? 'offense' : isWall ? 'defense' : 'balanced';
  });

  const offenseCount = roles.filter(r => r === 'offense').length;
  const defenseCount = roles.filter(r => r === 'defense').length;

  if (offenseCount >= 5) {
    recommendations.push({
      type: 'swap',
      message: 'Your team is very offensive. Consider adding a defensive pivot or wall.',
      priority: 'medium'
    });
  } else if (defenseCount >= 4) {
    recommendations.push({
      type: 'swap',
      message: 'Your team is very defensive. Consider adding more offensive pressure.',
      priority: 'medium'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });
}

function calculateOverallScore(
  team: Pokemon[],
  weaknesses: any[],
  offensiveCoverage: Record<PokemonType, number>,
  synergies: any[]
): number {
  let score = 100;

  // Penalize for shared weaknesses
  weaknesses.forEach(w => {
    if (w.count >= 4) score -= 20;
    else if (w.count >= 3) score -= 10;
  });

  // Reward for offensive coverage
  const coverageCount = Object.values(offensiveCoverage).filter(v => v > 0).length;
  score += (coverageCount / allTypes.length) * 20;

  // Reward for synergies
  score += Math.min(synergies.length * 3, 15);

  // Penalize for incomplete team
  if (team.length < 6) {
    score -= (6 - team.length) * 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getEmptyAnalysis(): TeamAnalysis {
  return {
    overallScore: 0,
    typecoverage: {
      offensive: {} as any,
      defensive: {} as any
    },
    weaknesses: [],
    strengths: [],
    synergies: [],
    threats: [],
    recommendations: [{
      type: 'add',
      message: 'Add Pokemon to your team to get started with analysis.',
      priority: 'high'
    }]
  };
}
