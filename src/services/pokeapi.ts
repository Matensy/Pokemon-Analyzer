import axios from 'axios';
import { Pokemon, PokemonType, Move, PokemonAbility, PokemonStats, Generation, TypeEffectiveness } from '../types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

// Cache for optimization
const cache = new Map<string, any>();
const pokemonBasicCache = new Map<number, Pokemon>();

// Helper to get from cache or fetch
async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const response = await axios.get<T>(url);
  cache.set(url, response.data);
  return response.data;
}

// Get generation from Pokemon ID
function getGeneration(id: number): Generation {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

// Calculate type effectiveness
function calculateTypeEffectiveness(types: PokemonType[]): TypeEffectiveness {
  const effectiveness: Record<PokemonType, number> = {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1,
    fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1,
    bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 1, fairy: 1
  };

  const typeChart: Record<PokemonType, { weak: PokemonType[], resist: PokemonType[], immune: PokemonType[] }> = {
    normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
    fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
    water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
    electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
    grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [] },
    ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
    fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
    poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
    ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
    flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
    psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
    bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
    rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
    ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
    dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [] },
    dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
    steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
    fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] }
  };

  types.forEach(type => {
    const typeData = typeChart[type];
    typeData.weak.forEach(weakType => effectiveness[weakType] *= 2);
    typeData.resist.forEach(resistType => effectiveness[resistType] *= 0.5);
    typeData.immune.forEach(immuneType => effectiveness[immuneType] = 0);
  });

  const result: TypeEffectiveness = { immune: [], weakTo: [], resistantTo: [], doubleWeakTo: [] };

  (Object.keys(effectiveness) as PokemonType[]).forEach(type => {
    const value = effectiveness[type];
    if (value === 0) result.immune.push(type);
    else if (value === 4) result.doubleWeakTo.push(type);
    else if (value === 2) result.weakTo.push(type);
    else if (value < 1) result.resistantTo.push(type);
  });

  return result;
}

// FAST: Fetch basic Pokemon data (no moves, minimal API calls)
export async function fetchPokemonBasic(id: number): Promise<Pokemon> {
  if (pokemonBasicCache.has(id)) {
    return pokemonBasicCache.get(id)!;
  }

  try {
    const data = await fetchWithCache<any>(`${API_BASE}/pokemon/${id}`);
    const types: PokemonType[] = data.types.map((t: any) => t.type.name);

    const stats: PokemonStats = {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      specialAttack: data.stats[3].base_stat,
      specialDefense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
      total: data.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
    };

    // Basic abilities without descriptions
    const abilities: PokemonAbility[] = data.abilities.map((a: any) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      description: ''
    }));

    // Basic moves from data (no API calls)
    const moves: Move[] = data.moves.slice(0, 30).map((m: any) => ({
      name: m.move.name,
      type: 'normal' as PokemonType,
      category: 'physical' as const,
      power: null,
      accuracy: null,
      pp: 20,
      priority: 0,
      description: '',
      learnMethod: 'level-up' as const,
      level: m.version_group_details[0]?.level_learned_at || 1
    }));

    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      types,
      stats,
      abilities,
      generation: getGeneration(data.id),
      sprite: data.sprites.front_default,
      spriteShiny: data.sprites.front_shiny,
      artwork: data.sprites.other['official-artwork'].front_default,
      height: data.height,
      weight: data.weight,
      moves,
      recommendedMovesets: [],
      typeEffectiveness: calculateTypeEffectiveness(types)
    };

    pokemonBasicCache.set(id, pokemon);
    return pokemon;
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error);
    throw error;
  }
}

// FAST: Fetch multiple Pokemon in parallel batches
export async function fetchPokemonBatch(ids: number[], batchSize: number = 10): Promise<Pokemon[]> {
  const results: Pokemon[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(id => fetchPokemonBasic(id).catch(() => null)));
    results.push(...batchResults.filter((p): p is Pokemon => p !== null));
  }

  return results;
}

// Fetch a single Pokemon
export async function fetchPokemon(idOrName: string | number): Promise<Pokemon> {
  try {
    const data = await fetchWithCache<any>(`${API_BASE}/pokemon/${idOrName}`);
    // const speciesData = await fetchWithCache<any>(`${API_BASE}/pokemon-species/${data.id}`);

    const types: PokemonType[] = data.types.map((t: any) => t.type.name);

    const stats: PokemonStats = {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      specialAttack: data.stats[3].base_stat,
      specialDefense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
      total: data.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
    };

    const abilities: PokemonAbility[] = await Promise.all(
      data.abilities.map(async (a: any) => {
        const abilityData = await fetchWithCache<any>(a.ability.url);
        const description = abilityData.effect_entries.find((e: any) => e.language.name === 'en')?.effect || '';
        return {
          name: a.ability.name,
          isHidden: a.is_hidden,
          description
        };
      })
    );

    // Fetch moves (limited to important ones for performance)
    const moves: Move[] = await Promise.all(
      data.moves.slice(0, 50).map(async (m: any) => {
        try {
          const moveData = await fetchWithCache<any>(m.move.url);
          const learnMethod = m.version_group_details[0]?.move_learn_method.name || 'level-up';
          const level = m.version_group_details[0]?.level_learned_at;

          return {
            name: moveData.name,
            type: moveData.type.name,
            category: moveData.damage_class.name,
            power: moveData.power,
            accuracy: moveData.accuracy,
            pp: moveData.pp,
            priority: moveData.priority,
            description: moveData.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect || '',
            learnMethod: learnMethod as any,
            level
          };
        } catch {
          return null;
        }
      })
    );

    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      types,
      stats,
      abilities,
      generation: getGeneration(data.id),
      sprite: data.sprites.front_default,
      spriteShiny: data.sprites.front_shiny,
      artwork: data.sprites.other['official-artwork'].front_default,
      height: data.height,
      weight: data.weight,
      moves: moves.filter(m => m !== null) as Move[],
      recommendedMovesets: [], // Will be filled by moveset service
      typeEffectiveness: calculateTypeEffectiveness(types)
    };

    return pokemon;
  } catch (error) {
    console.error(`Error fetching Pokemon ${idOrName}:`, error);
    throw error;
  }
}

// Fetch Pokemon list with pagination
export async function fetchPokemonList(limit: number = 20, offset: number = 0) {
  try {
    const data = await fetchWithCache<any>(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
    return {
      count: data.count,
      results: data.results.map((p: any, index: number) => ({
        id: offset + index + 1,
        name: p.name,
        url: p.url
      }))
    };
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
}

// Fetch all Pokemon IDs (for complete Pokedex)
export async function fetchAllPokemonIds(): Promise<number[]> {
  try {
    // Gen 1-9: Pokemon #1 to #1025
    const data = await fetchWithCache<any>(`${API_BASE}/pokemon?limit=1025&offset=0`);
    return data.results.map((_: any, index: number) => index + 1);
  } catch (error) {
    console.error('Error fetching all Pokemon IDs:', error);
    throw error;
  }
}

// Fetch Pokemon by type
export async function fetchPokemonByType(type: PokemonType): Promise<number[]> {
  try {
    const data = await fetchWithCache<any>(`${API_BASE}/type/${type}`);
    return data.pokemon.map((p: any) => {
      const id = parseInt(p.pokemon.url.split('/').slice(-2, -1)[0]);
      return id;
    }).filter((id: number) => id <= 1025);
  } catch (error) {
    console.error(`Error fetching Pokemon by type ${type}:`, error);
    throw error;
  }
}

// Fetch Pokemon by generation
export async function fetchPokemonByGeneration(gen: Generation): Promise<number[]> {
  const ranges: Record<Generation, [number, number]> = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025]
  };

  const [start, end] = ranges[gen];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Search Pokemon by name
export async function searchPokemon(query: string): Promise<Pokemon[]> {
  try {
    // Try direct fetch first
    try {
      const pokemon = await fetchPokemon(query.toLowerCase());
      return [pokemon];
    } catch {
      // If direct fetch fails, search through all Pokemon
      const allIds = await fetchAllPokemonIds();
      const results: Pokemon[] = [];

      for (const id of allIds.slice(0, 100)) { // Limit search for performance
        try {
          const pokemon = await fetchPokemon(id);
          if (pokemon.name.includes(query.toLowerCase())) {
            results.push(pokemon);
          }
        } catch {
          continue;
        }
      }

      return results;
    }
  } catch (error) {
    console.error('Error searching Pokemon:', error);
    return [];
  }
}
