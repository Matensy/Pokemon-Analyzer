import axios from 'axios';
import { Move, PokemonType } from '../types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

// Cache for Pokemon learnsets
const learnsetCache = new Map<string, Set<string>>();
const moveDataCache = new Map<string, Move>();

// Fetch all moves a Pokemon can learn
export async function fetchPokemonLearnset(pokemonName: string): Promise<Set<string>> {
  const name = pokemonName.toLowerCase();

  if (learnsetCache.has(name)) {
    return learnsetCache.get(name)!;
  }

  try {
    const response = await axios.get(`${API_BASE}/pokemon/${name}`);
    const learnset = new Set<string>();

    for (const moveEntry of response.data.moves) {
      learnset.add(moveEntry.move.name.toLowerCase());
    }

    learnsetCache.set(name, learnset);
    return learnset;
  } catch (error) {
    console.error(`Error fetching learnset for ${name}:`, error);
    return new Set();
  }
}

// Fetch move data from API
export async function fetchMoveData(moveName: string): Promise<Move | null> {
  const name = moveName.toLowerCase().replace(/ /g, '-');

  if (moveDataCache.has(name)) {
    return moveDataCache.get(name)!;
  }

  try {
    const response = await axios.get(`${API_BASE}/move/${name}`);
    const data = response.data;

    const move: Move = {
      name: data.name,
      type: data.type.name as PokemonType,
      category: data.damage_class.name as 'physical' | 'special' | 'status',
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      priority: data.priority,
      learnMethod: 'level-up',
      description: data.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect || ''
    };

    moveDataCache.set(name, move);
    return move;
  } catch (error) {
    console.error(`Error fetching move ${name}:`, error);
    return null;
  }
}

// Check if a Pokemon can learn a specific move
export async function canPokemonLearnMove(pokemonName: string, moveName: string): Promise<boolean> {
  const learnset = await fetchPokemonLearnset(pokemonName);
  const normalizedMove = moveName.toLowerCase().replace(/ /g, '-');
  return learnset.has(normalizedMove);
}

// Validate a list of moves for a Pokemon
export async function validateMoves(
  pokemonName: string,
  moves: string[]
): Promise<{ move: string; canLearn: boolean; moveData: Move | null }[]> {
  const learnset = await fetchPokemonLearnset(pokemonName);

  const results = await Promise.all(
    moves.map(async (moveName) => {
      const normalizedMove = moveName.toLowerCase().replace(/ /g, '-');
      const canLearn = learnset.has(normalizedMove);
      const moveData = await fetchMoveData(normalizedMove);

      return {
        move: moveName,
        canLearn,
        moveData
      };
    })
  );

  return results;
}

// Get all learnable moves for a Pokemon with full data
export async function getLearnableMoves(pokemonName: string): Promise<Move[]> {
  try {
    const response = await axios.get(`${API_BASE}/pokemon/${pokemonName.toLowerCase()}`);
    const moves: Move[] = [];

    // Fetch move data in parallel batches
    const moveEntries = response.data.moves;
    const batchSize = 20;

    for (let i = 0; i < Math.min(moveEntries.length, 100); i += batchSize) {
      const batch = moveEntries.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (entry: any) => {
          try {
            const moveResponse = await axios.get(entry.move.url);
            const data = moveResponse.data;

            return {
              name: data.name,
              type: data.type.name as PokemonType,
              category: data.damage_class.name as 'physical' | 'special' | 'status',
              power: data.power,
              accuracy: data.accuracy,
              pp: data.pp,
              priority: data.priority,
              learnMethod: entry.version_group_details[0]?.move_learn_method.name || 'level-up',
              description: data.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect || ''
            } as Move;
          } catch {
            return null;
          }
        })
      );

      moves.push(...batchResults.filter((m): m is Move => m !== null));
    }

    // Sort by power (attacking moves first)
    return moves.sort((a, b) => (b.power || 0) - (a.power || 0));
  } catch (error) {
    console.error(`Error fetching moves for ${pokemonName}:`, error);
    return [];
  }
}

// Competitive move recommendations based on Pokemon stats and type
export function getRecommendedMoves(pokemon: {
  name: string;
  types: PokemonType[];
  stats: { attack: number; specialAttack: number; speed: number };
}, availableMoves: Move[]): Move[] {
  const isPhysical = pokemon.stats.attack > pokemon.stats.specialAttack;
  const preferredCategory = isPhysical ? 'physical' : 'special';

  // Priority: STAB moves with good power
  const stabMoves = availableMoves.filter(m =>
    pokemon.types.includes(m.type) &&
    m.power && m.power >= 60 &&
    m.category === preferredCategory
  );

  // Coverage moves (non-STAB)
  const coverageMoves = availableMoves.filter(m =>
    !pokemon.types.includes(m.type) &&
    m.power && m.power >= 60 &&
    m.category === preferredCategory
  );

  // Status/Setup moves
  const setupMoves = availableMoves.filter(m =>
    m.category === 'status' &&
    ['swords-dance', 'dragon-dance', 'nasty-plot', 'calm-mind', 'quiver-dance',
     'shell-smash', 'bulk-up', 'agility', 'rock-polish', 'autotomize'].includes(m.name)
  );

  // Priority moves
  const priorityMoves = availableMoves.filter(m =>
    m.priority && m.priority > 0 && m.power && m.power > 0
  );

  // Build recommended set
  const recommended: Move[] = [];

  // Add 1-2 STAB moves
  recommended.push(...stabMoves.slice(0, 2));

  // Add 1 setup move if available
  if (setupMoves.length > 0) {
    recommended.push(setupMoves[0]);
  }

  // Add coverage
  for (const move of coverageMoves) {
    if (recommended.length >= 4) break;
    if (!recommended.find(m => m.type === move.type)) {
      recommended.push(move);
    }
  }

  // Add priority if needed
  if (recommended.length < 4 && priorityMoves.length > 0) {
    recommended.push(priorityMoves[0]);
  }

  // Fill remaining with best available
  for (const move of availableMoves) {
    if (recommended.length >= 4) break;
    if (!recommended.includes(move) && move.power && move.power >= 50) {
      recommended.push(move);
    }
  }

  return recommended.slice(0, 4);
}
