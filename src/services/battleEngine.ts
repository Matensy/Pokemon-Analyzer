import { BattlePokemon, BattleState, DamageCalculation, StatusCondition } from '../types/battle';
import { Move, PokemonType } from '../types/pokemon';

// Battle Engine - Damage calculation and battle logic

export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move
): DamageCalculation {
  if (!move.power) {
    return {
      damage: 0,
      effectiveness: 1,
      isCritical: false,
      description: `${attacker.name} used ${move.name}!`
    };
  }

  const level = attacker.level;
  const power = move.power;

  // Determine if physical or special
  const isPhysical = move.category === 'physical';
  const attack = isPhysical
    ? calculateStat(attacker.stats.attack, attacker.statStages.attack)
    : calculateStat(attacker.stats.specialAttack, attacker.statStages.specialAttack);

  const defense = isPhysical
    ? calculateStat(defender.stats.defense, defender.statStages.defense)
    : calculateStat(defender.stats.specialDefense, defender.statStages.specialDefense);

  // Base damage calculation
  let damage = Math.floor(
    Math.floor(
      Math.floor((2 * level) / 5 + 2) * power * (attack / defense)
    ) / 50
  ) + 2;

  // STAB (Same Type Attack Bonus)
  const hasSTAB = attacker.types.includes(move.type);
  if (hasSTAB) {
    damage = Math.floor(damage * 1.5);
  }

  // Type effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  damage = Math.floor(damage * effectiveness);

  // Critical hit (10% chance, 1.5x damage)
  const isCritical = Math.random() < 0.1;
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  // Random factor (85-100%)
  const randomFactor = 0.85 + Math.random() * 0.15;
  damage = Math.floor(damage * randomFactor);

  // Burn reduces physical damage
  if (attacker.status.name === 'burn' && isPhysical) {
    damage = Math.floor(damage * 0.5);
  }

  // Item effects
  if (attacker.heldItem?.id === 'life-orb') {
    damage = Math.floor(damage * 1.3);
  } else if (attacker.heldItem?.id === 'choice-band' && isPhysical) {
    damage = Math.floor(damage * 1.5);
  } else if (attacker.heldItem?.id === 'choice-specs' && !isPhysical) {
    damage = Math.floor(damage * 1.5);
  }

  if (defender.heldItem?.id === 'assault-vest' && !isPhysical) {
    damage = Math.floor(damage * 0.67);
  }

  // Minimum 1 damage
  damage = Math.max(1, damage);

  // Build description
  let description = `${attacker.name} used ${move.name}!`;
  if (isCritical) description += ' A critical hit!';
  if (effectiveness > 1) description += " It's super effective!";
  if (effectiveness < 1 && effectiveness > 0) description += " It's not very effective...";
  if (effectiveness === 0) description += " It doesn't affect " + defender.name + "...";

  return {
    damage,
    effectiveness,
    isCritical,
    description
  };
}

function calculateStat(baseStat: number, stage: number): number {
  const stageMultiplier = stage >= 0
    ? (2 + stage) / 2
    : 2 / (2 - stage);

  return Math.floor(baseStat * stageMultiplier);
}

function getTypeEffectiveness(moveType: PokemonType, defenderTypes: PokemonType[]): number {
  let effectiveness = 1;

  defenderTypes.forEach(type => {
    effectiveness *= getTypeDamageMultiplier(moveType, type);
  });

  return effectiveness;
}

function getTypeDamageMultiplier(attackType: PokemonType, defendType: PokemonType): number {
  const chart: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };

  return chart[attackType]?.[defendType] ?? 1;
}

export function applyDamage(pokemon: BattlePokemon, damage: number): void {
  pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
  if (pokemon.currentHp === 0) {
    pokemon.isFainted = true;
    pokemon.isActive = false;
  }
}

export function healPokemon(pokemon: BattlePokemon, amount: number): number {
  const oldHp = pokemon.currentHp;
  pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + amount);
  return pokemon.currentHp - oldHp;
}

export function cureStatus(pokemon: BattlePokemon): void {
  pokemon.status = { name: null };
}

export function applyStatus(pokemon: BattlePokemon, status: StatusCondition): boolean {
  // Can't apply status if already has one
  if (pokemon.status.name !== null) return false;

  pokemon.status = status;
  return true;
}

export function processEndOfTurn(battleState: BattleState): string[] {
  const logs: string[] = [];

  // Process both teams
  [battleState.playerTeam, battleState.aiTeam].forEach(team => {
    team.selectedForBattle.forEach(pokemon => {
      if (pokemon.isFainted || !pokemon.isActive) return;

      // Status damage
      if (pokemon.status.name === 'burn' || pokemon.status.name === 'poison') {
        const damage = Math.floor(pokemon.maxHp / 8);
        applyDamage(pokemon, damage);
        logs.push(`${pokemon.name} is hurt by ${pokemon.status.name}!`);
      } else if (pokemon.status.name === 'badly-poison') {
        const turns = pokemon.status.turnsRemaining || 1;
        const damage = Math.floor((pokemon.maxHp / 16) * turns);
        applyDamage(pokemon, damage);
        logs.push(`${pokemon.name} is badly poisoned!`);
        pokemon.status.turnsRemaining = turns + 1;
      }

      // Leftovers healing
      if (pokemon.heldItem?.id === 'leftovers') {
        const healing = Math.floor(pokemon.maxHp / 16);
        const healed = healPokemon(pokemon, healing);
        if (healed > 0) {
          logs.push(`${pokemon.name} restored a little HP using Leftovers!`);
        }
      }

      // Life Orb recoil
      if (pokemon.heldItem?.id === 'life-orb' && pokemon.isActive) {
        const recoil = Math.floor(pokemon.maxHp / 10);
        applyDamage(pokemon, recoil);
        logs.push(`${pokemon.name} lost some HP due to Life Orb!`);
      }
    });
  });

  return logs;
}

export function checkBattleEnd(battleState: BattleState): boolean {
  const playerAlive = battleState.playerTeam.selectedForBattle.some(p => !p.isFainted);
  const aiAlive = battleState.aiTeam.selectedForBattle.some(p => !p.isFainted);

  if (!playerAlive && !aiAlive) {
    battleState.winner = 'draw';
    battleState.battleEnded = true;
    return true;
  } else if (!playerAlive) {
    battleState.winner = 'ai';
    battleState.battleEnded = true;
    return true;
  } else if (!aiAlive) {
    battleState.winner = 'player';
    battleState.battleEnded = true;
    return true;
  }

  return false;
}

export function canUseMove(pokemon: BattlePokemon, moveIndex: number): boolean {
  // Add PP check, disable check, etc. here if needed
  return moveIndex >= 0 && moveIndex < pokemon.selectedMoves.length;
}

export function getSpeedOrder(pokemon1: BattlePokemon, pokemon2: BattlePokemon): [BattlePokemon, BattlePokemon] {
  const speed1 = calculateEffectiveSpeed(pokemon1);
  const speed2 = calculateEffectiveSpeed(pokemon2);

  if (speed1 > speed2) {
    return [pokemon1, pokemon2];
  } else if (speed2 > speed1) {
    return [pokemon2, pokemon1];
  } else {
    // Speed tie - random
    return Math.random() > 0.5 ? [pokemon1, pokemon2] : [pokemon2, pokemon1];
  }
}

function calculateEffectiveSpeed(pokemon: BattlePokemon): number {
  let speed = calculateStat(pokemon.stats.speed, pokemon.statStages.speed);

  if (pokemon.status.name === 'paralysis') {
    speed = Math.floor(speed * 0.5);
  }

  if (pokemon.heldItem?.id === 'choice-scarf') {
    speed = Math.floor(speed * 1.5);
  }

  return speed;
}
