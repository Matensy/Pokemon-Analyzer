import { Pokemon } from '../types/pokemon';
import {
  Move,
  competitiveMoves,
  calculateDamage,
  rollCritical,
  rollAccuracy,
  getBestMove,
  getEffectivenessText,
} from './damageCalculator';

export type BattlePhase = 'setup' | 'player-turn' | 'ai-turn' | 'animation' | 'finished';

export interface BattlePokemon {
  pokemon: Pokemon;
  currentHP: number;
  maxHP: number;
  moves: Move[];
  isFainted: boolean;
}

export interface BattleLog {
  message: string;
  type: 'info' | 'damage' | 'effectiveness' | 'faint' | 'critical';
  timestamp: number;
}

export interface BattleState {
  phase: BattlePhase;
  playerPokemon: BattlePokemon | null;
  aiPokemon: BattlePokemon | null;
  playerTeam: BattlePokemon[];
  aiTeam: BattlePokemon[];
  logs: BattleLog[];
  turn: number;
  winner: 'player' | 'ai' | null;
}

export class BattleEngine {
  private state: BattleState;

  constructor(playerTeam: Pokemon[], aiTeam: Pokemon[]) {
    // Initialize battle Pokemon with full HP and moves
    const playerBattleTeam = playerTeam.map(p => this.createBattlePokemon(p));
    const aiBattleTeam = aiTeam.map(p => this.createBattlePokemon(p));

    this.state = {
      phase: 'setup',
      playerPokemon: playerBattleTeam[0] || null,
      aiPokemon: aiBattleTeam[0] || null,
      playerTeam: playerBattleTeam,
      aiTeam: aiBattleTeam,
      logs: [],
      turn: 1,
      winner: null,
    };

    this.addLog(`Battle started! Turn ${this.state.turn}`, 'info');
    if (this.state.playerPokemon) {
      this.addLog(`Go, ${this.state.playerPokemon.pokemon.name}!`, 'info');
    }
    if (this.state.aiPokemon) {
      this.addLog(`Opponent sent out ${this.state.aiPokemon.pokemon.name}!`, 'info');
    }
  }

  private createBattlePokemon(pokemon: Pokemon): BattlePokemon {
    // Get competitive moves for this Pokemon
    const moves = this.getCompetitiveMoves(pokemon);

    return {
      pokemon,
      currentHP: pokemon.stats.hp,
      maxHP: pokemon.stats.hp,
      moves,
      isFainted: false,
    };
  }

  private getCompetitiveMoves(pokemon: Pokemon): Move[] {
    const moves: Move[] = [];

    // Try to get recommended moveset moves first
    if (pokemon.recommendedMovesets && pokemon.recommendedMovesets.length > 0) {
      const moveset = pokemon.recommendedMovesets[0];
      for (const moveName of moveset.moves) {
        const move = competitiveMoves[moveName];
        if (move) {
          moves.push(move);
        }
      }
    }

    // Fill remaining slots with Pokemon's actual moves if available
    if (moves.length < 4 && pokemon.moves && pokemon.moves.length > 0) {
      for (const pokemonMove of pokemon.moves) {
        if (moves.length >= 4) break;

        const move = competitiveMoves[pokemonMove.name];
        if (move && !moves.find(m => m.name === move.name)) {
          moves.push(move);
        }
      }
    }

    // If still no moves, assign basic moves based on type
    while (moves.length < 4) {
      const type = pokemon.types[0];
      const fallbackMoves: Record<string, string> = {
        fire: 'flamethrower',
        water: 'surf',
        grass: 'energy-ball',
        electric: 'thunderbolt',
        ice: 'ice-beam',
        fighting: 'close-combat',
        poison: 'sludge-bomb',
        ground: 'earthquake',
        flying: 'air-slash',
        psychic: 'psychic',
        bug: 'bug-buzz',
        rock: 'stone-edge',
        ghost: 'shadow-ball',
        dragon: 'outrage',
        dark: 'dark-pulse',
        steel: 'flash-cannon',
        fairy: 'moonblast',
        normal: 'extreme-speed',
      };

      const fallbackMove = competitiveMoves[fallbackMoves[type] || 'extreme-speed'];
      if (!moves.find(m => m.name === fallbackMove.name)) {
        moves.push(fallbackMove);
      } else {
        // Add a random move
        const randomMoveKey = Object.keys(competitiveMoves)[
          Math.floor(Math.random() * Object.keys(competitiveMoves).length)
        ];
        const randomMove = competitiveMoves[randomMoveKey];
        if (!moves.find(m => m.name === randomMove.name)) {
          moves.push(randomMove);
        } else {
          break;
        }
      }
    }

    return moves.slice(0, 4);
  }

  private addLog(message: string, type: BattleLog['type'] = 'info') {
    this.state.logs.push({
      message,
      type,
      timestamp: Date.now(),
    });
  }

  public getState(): BattleState {
    return { ...this.state };
  }

  public playerUseMove(moveIndex: number): BattleState {
    if (!this.state.playerPokemon || !this.state.aiPokemon) {
      return this.getState();
    }

    if (this.state.playerPokemon.isFainted) {
      this.addLog(`${this.state.playerPokemon.pokemon.name} has fainted!`, 'faint');
      return this.getState();
    }

    const move = this.state.playerPokemon.moves[moveIndex];
    if (!move) {
      this.addLog('Invalid move!', 'info');
      return this.getState();
    }

    // Player attacks
    this.executeAttack(this.state.playerPokemon, this.state.aiPokemon, move, 'player');

    // Check if AI Pokemon fainted
    if (this.state.aiPokemon.isFainted) {
      this.handleFaint('ai');
      return this.getState();
    }

    // AI counter-attacks
    this.state.phase = 'ai-turn';
    setTimeout(() => this.aiTurn(), 1000);

    return this.getState();
  }

  public aiTurn(): BattleState {
    if (!this.state.aiPokemon || !this.state.playerPokemon) {
      return this.getState();
    }

    if (this.state.aiPokemon.isFainted) {
      this.handleFaint('ai');
      return this.getState();
    }

    // AI selects best move
    const bestMove = getBestMove(
      this.state.aiPokemon.pokemon,
      this.state.playerPokemon.pokemon,
      this.state.aiPokemon.moves
    );

    this.executeAttack(this.state.aiPokemon, this.state.playerPokemon, bestMove, 'ai');

    // Check if player Pokemon fainted
    if (this.state.playerPokemon.isFainted) {
      this.handleFaint('player');
      return this.getState();
    }

    // Next turn
    this.state.turn++;
    this.state.phase = 'player-turn';
    this.addLog(`Turn ${this.state.turn}`, 'info');

    return this.getState();
  }

  private executeAttack(
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: Move,
    attackerSide: 'player' | 'ai'
  ) {
    const attackerName = attacker.pokemon.name;

    // Check accuracy
    if (!rollAccuracy(move.accuracy)) {
      this.addLog(`${attackerName} used ${move.name} but it missed!`, 'info');
      return;
    }

    // Check critical
    const isCritical = rollCritical();

    // Calculate damage
    const damageCalc = calculateDamage(
      attacker.pokemon,
      defender.pokemon,
      move,
      isCritical
    );

    this.addLog(`${attackerName} used ${move.name}!`, 'info');

    if (damageCalc.damage > 0) {
      // Apply damage
      defender.currentHP = Math.max(0, defender.currentHP - damageCalc.damage);

      this.addLog(
        `Dealt ${damageCalc.damage} damage! (${Math.round(damageCalc.damagePercent)}% of HP)`,
        'damage'
      );

      // Show effectiveness
      if (damageCalc.effectiveness !== 1) {
        this.addLog(getEffectivenessText(damageCalc.effectiveness), 'effectiveness');
      }

      // Show critical
      if (isCritical) {
        this.addLog('Critical hit!', 'critical');
      }

      // Check if fainted
      if (defender.currentHP === 0) {
        defender.isFainted = true;
        this.addLog(`${defender.pokemon.name} fainted!`, 'faint');
      }
    }
  }

  private handleFaint(side: 'player' | 'ai') {
    const team = side === 'player' ? this.state.playerTeam : this.state.aiTeam;
    const availablePokemon = team.filter(p => !p.isFainted);

    if (availablePokemon.length === 0) {
      // Battle over
      this.state.winner = side === 'player' ? 'ai' : 'player';
      this.state.phase = 'finished';
      this.addLog(
        `${this.state.winner === 'player' ? 'You' : 'Opponent'} won the battle!`,
        'info'
      );
    } else {
      // Switch to next Pokemon
      const nextPokemon = availablePokemon[0];
      if (side === 'player') {
        this.state.playerPokemon = nextPokemon;
        this.addLog(`Go, ${nextPokemon.pokemon.name}!`, 'info');
      } else {
        this.state.aiPokemon = nextPokemon;
        this.addLog(`Opponent sent out ${nextPokemon.pokemon.name}!`, 'info');
      }
    }
  }

  public switchPokemon(teamIndex: number, side: 'player' | 'ai'): BattleState {
    const team = side === 'player' ? this.state.playerTeam : this.state.aiTeam;
    const pokemon = team[teamIndex];

    if (!pokemon || pokemon.isFainted) {
      this.addLog('Cannot switch to that Pokemon!', 'info');
      return this.getState();
    }

    if (side === 'player') {
      this.state.playerPokemon = pokemon;
      this.addLog(`Go, ${pokemon.pokemon.name}!`, 'info');
    } else {
      this.state.aiPokemon = pokemon;
      this.addLog(`Opponent sent out ${pokemon.pokemon.name}!`, 'info');
    }

    return this.getState();
  }

  public forfeit(side: 'player' | 'ai'): BattleState {
    this.state.winner = side === 'player' ? 'ai' : 'player';
    this.state.phase = 'finished';
    this.addLog(`${side === 'player' ? 'You' : 'Opponent'} forfeited!`, 'info');
    return this.getState();
  }
}

/**
 * Generate a random competitive AI team
 */
export function generateAITeam(allPokemon: Pokemon[], teamSize: number = 3): Pokemon[] {
  // Meta Pokemon that make good competitive teams
  const metaPokemonIds = [
    6, 94, 130, 143, 144, 145, 146, 150, 151, // Gen 1 legendaries
    248, 249, 250, 384, 445, 448, 483, 484, 487, // Gen 4 meta
    530, 596, 609, 635, 643, 644, 645, 646, // Gen 5 meta
    658, 706, 715, 717, 720, 721, 778, 784, 785, 786, 787, // Gen 6-7
    810, 812, 815, 818, 823, 834, 836, 839, 841, 884, 887, 892, 893, 894, 895, 896, 897, 898 // Gen 8
  ];

  const team: Pokemon[] = [];

  // Try to use meta Pokemon if available
  for (const id of metaPokemonIds) {
    const pokemon = allPokemon.find(p => p.id === id);
    if (pokemon && team.length < teamSize) {
      team.push(pokemon);
    }
  }

  // Fill remaining slots with high base stat Pokemon
  if (team.length < teamSize) {
    const sortedPokemon = [...allPokemon]
      .filter(p => !team.includes(p))
      .sort((a, b) => b.stats.total - a.stats.total);

    while (team.length < teamSize && sortedPokemon.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(50, sortedPokemon.length));
      team.push(sortedPokemon[randomIndex]);
      sortedPokemon.splice(randomIndex, 1);
    }
  }

  return team.slice(0, teamSize);
}
