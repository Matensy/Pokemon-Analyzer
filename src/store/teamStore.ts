import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pokemon } from '../types/pokemon';

interface TeamStore {
  team: Pokemon[];
  addPokemon: (pokemon: Pokemon) => void;
  removePokemon: (pokemonId: number) => void;
  clearTeam: () => void;
  updatePokemon: (index: number, pokemon: Pokemon) => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      team: [],
      addPokemon: (pokemon) =>
        set((state) => {
          if (state.team.length >= 6) {
            alert('Team is full! Maximum 6 Pokemon allowed.');
            return state;
          }
          if (state.team.some((p) => p.id === pokemon.id)) {
            alert('This Pokemon is already in your team!');
            return state;
          }
          return { team: [...state.team, pokemon] };
        }),
      removePokemon: (pokemonId) =>
        set((state) => ({
          team: state.team.filter((p) => p.id !== pokemonId),
        })),
      clearTeam: () => set({ team: [] }),
      updatePokemon: (index, pokemon) =>
        set((state) => {
          const newTeam = [...state.team];
          newTeam[index] = pokemon;
          return { team: newTeam };
        }),
    }),
    {
      name: 'pokemon-team',
    }
  )
);
