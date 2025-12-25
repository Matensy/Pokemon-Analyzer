// Pokemon Name Index for Global Search
// Pre-load all 1025 Pokemon names for instant search

import axios from 'axios';

const API_BASE = 'https://pokeapi.co/api/v2';

export interface PokemonEntry {
  id: number;
  name: string;
  generation: number;
}

let pokemonIndex: PokemonEntry[] = [];
let indexPromise: Promise<PokemonEntry[]> | null = null;
let indexLoaded = false;

function getGeneration(id: number): number {
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

// Load all Pokemon names (lightweight - single API call)
export async function loadPokemonIndex(): Promise<PokemonEntry[]> {
  if (indexLoaded) {
    return pokemonIndex;
  }

  if (indexPromise) {
    return indexPromise;
  }

  indexPromise = (async () => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon?limit=1025&offset=0`);
      pokemonIndex = response.data.results.map((p: { name: string }, index: number) => ({
        id: index + 1,
        name: p.name,
        generation: getGeneration(index + 1)
      }));
      indexLoaded = true;
      return pokemonIndex;
    } catch (error) {
      console.error('Error loading Pokemon index:', error);
      return [];
    }
  })();

  return indexPromise;
}

// Search Pokemon by name or ID globally
export async function searchPokemonGlobal(query: string): Promise<PokemonEntry[]> {
  const index = await loadPokemonIndex();
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return [];

  // Search by ID
  const numQuery = parseInt(lowerQuery);
  if (!isNaN(numQuery)) {
    return index.filter(p => p.id === numQuery || p.id.toString().includes(lowerQuery));
  }

  // Search by name (partial match)
  return index.filter(p => p.name.includes(lowerQuery));
}

// Get index (sync if already loaded)
export function getPokemonIndex(): PokemonEntry[] {
  return pokemonIndex;
}
