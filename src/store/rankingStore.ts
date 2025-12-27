// ELO/Ranking System Store - Persistent battle history and rankings
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerRating, MatchRecord, RankTier, BattleFormat } from '../types/battle';

interface RankingStore {
  // Player data
  player: PlayerRating;

  // Actions
  recordMatch: (record: Omit<MatchRecord, 'id' | 'date' | 'eloChange'>) => void;
  updateUsername: (username: string) => void;
  resetStats: () => void;
  getMatchHistory: (limit?: number) => MatchRecord[];
  getWinRate: () => number;
  getStreak: () => { current: number; best: number };
}

// ELO calculation constants
const K_FACTOR = 32; // How much ratings change per match
const BASE_ELO = 1000;
const AI_ELO = 1200; // Assumed AI rating

// Rank thresholds
const RANK_THRESHOLDS: { tier: RankTier; minElo: number }[] = [
  { tier: 'Legend', minElo: 1800 },
  { tier: 'Elite', minElo: 1600 },
  { tier: 'Champion', minElo: 1400 },
  { tier: 'Master Ball', minElo: 1200 },
  { tier: 'Ultra Ball', minElo: 1000 },
  { tier: 'Great Ball', minElo: 800 },
  { tier: 'Poke Ball', minElo: 0 }
];

function calculateRank(elo: number): RankTier {
  for (const threshold of RANK_THRESHOLDS) {
    if (elo >= threshold.minElo) {
      return threshold.tier;
    }
  }
  return 'Poke Ball';
}

function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw'
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

  let actualScore: number;
  switch (result) {
    case 'win':
      actualScore = 1;
      break;
    case 'loss':
      actualScore = 0;
      break;
    case 'draw':
      actualScore = 0.5;
      break;
  }

  return Math.round(K_FACTOR * (actualScore - expectedScore));
}

function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createInitialPlayer(): PlayerRating {
  return {
    id: `player_${Date.now()}`,
    username: 'Trainer',
    elo: BASE_ELO,
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    bestWinStreak: 0,
    rank: 'Ultra Ball',
    matchHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export const useRankingStore = create<RankingStore>()(
  persist(
    (set, get) => ({
      player: createInitialPlayer(),

      recordMatch: (record) => {
        const { player } = get();

        // Calculate ELO change
        const eloChange = calculateEloChange(player.elo, AI_ELO, record.result);
        const newElo = Math.max(100, player.elo + eloChange); // Minimum 100 ELO

        // Create full match record
        const fullRecord: MatchRecord = {
          ...record,
          id: generateMatchId(),
          date: new Date(),
          eloChange
        };

        // Update streak
        let newWinStreak = player.winStreak;
        let newBestWinStreak = player.bestWinStreak;

        if (record.result === 'win') {
          newWinStreak++;
          if (newWinStreak > newBestWinStreak) {
            newBestWinStreak = newWinStreak;
          }
        } else if (record.result === 'loss') {
          newWinStreak = 0;
        }

        // Update player
        set({
          player: {
            ...player,
            elo: newElo,
            wins: player.wins + (record.result === 'win' ? 1 : 0),
            losses: player.losses + (record.result === 'loss' ? 1 : 0),
            draws: player.draws + (record.result === 'draw' ? 1 : 0),
            winStreak: newWinStreak,
            bestWinStreak: newBestWinStreak,
            rank: calculateRank(newElo),
            matchHistory: [fullRecord, ...player.matchHistory].slice(0, 100), // Keep last 100 matches
            updatedAt: new Date()
          }
        });
      },

      updateUsername: (username) => {
        set((state) => ({
          player: {
            ...state.player,
            username,
            updatedAt: new Date()
          }
        }));
      },

      resetStats: () => {
        set({ player: createInitialPlayer() });
      },

      getMatchHistory: (limit = 20) => {
        const { player } = get();
        return player.matchHistory.slice(0, limit);
      },

      getWinRate: () => {
        const { player } = get();
        const total = player.wins + player.losses + player.draws;
        if (total === 0) return 0;
        return Math.round((player.wins / total) * 100);
      },

      getStreak: () => {
        const { player } = get();
        return {
          current: player.winStreak,
          best: player.bestWinStreak
        };
      }
    }),
    {
      name: 'pokemon-ranking',
      // Custom serialization for Date objects
      serialize: (state) => JSON.stringify(state, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      }),
      deserialize: (str) => JSON.parse(str, (key, value) => {
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      })
    }
  )
);

// Helper functions for UI
export function getRankInfo(rank: RankTier): { color: string; icon: string; gradient: string } {
  switch (rank) {
    case 'Legend':
      return {
        color: '#FFD700',
        icon: '👑',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
      };
    case 'Elite':
      return {
        color: '#9333EA',
        icon: '💎',
        gradient: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)'
      };
    case 'Champion':
      return {
        color: '#EF4444',
        icon: '🏆',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
      };
    case 'Master Ball':
      return {
        color: '#EC4899',
        icon: '⚫',
        gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)'
      };
    case 'Ultra Ball':
      return {
        color: '#F59E0B',
        icon: '🟡',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
      };
    case 'Great Ball':
      return {
        color: '#3B82F6',
        icon: '🔵',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
      };
    case 'Poke Ball':
    default:
      return {
        color: '#EF4444',
        icon: '🔴',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
      };
  }
}

export function getNextRank(currentRank: RankTier): { rank: RankTier; eloNeeded: number } | null {
  const currentIndex = RANK_THRESHOLDS.findIndex(t => t.tier === currentRank);
  if (currentIndex <= 0) return null; // Already at max rank

  const nextThreshold = RANK_THRESHOLDS[currentIndex - 1];
  return {
    rank: nextThreshold.tier,
    eloNeeded: nextThreshold.minElo
  };
}

export function getEloProgress(elo: number): { current: number; next: number; progress: number } {
  const currentRankIndex = RANK_THRESHOLDS.findIndex(t => elo >= t.minElo);
  const currentThreshold = RANK_THRESHOLDS[currentRankIndex];
  const nextThreshold = currentRankIndex > 0 ? RANK_THRESHOLDS[currentRankIndex - 1] : null;

  if (!nextThreshold) {
    return { current: currentThreshold.minElo, next: currentThreshold.minElo, progress: 100 };
  }

  const range = nextThreshold.minElo - currentThreshold.minElo;
  const progress = ((elo - currentThreshold.minElo) / range) * 100;

  return {
    current: currentThreshold.minElo,
    next: nextThreshold.minElo,
    progress: Math.min(100, Math.max(0, progress))
  };
}
