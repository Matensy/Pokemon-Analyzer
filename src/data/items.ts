import { BattleItem } from '../types/battle';

// Complete list of usable items in battle

export const HEALING_ITEMS: BattleItem[] = [
  {
    id: 'potion',
    name: 'Potion',
    category: 'healing',
    power: 20,
    effect: 'Restores 20 HP',
    description: 'Restores 20 HP to a Pokémon',
    canUseInBattle: true
  },
  {
    id: 'super-potion',
    name: 'Super Potion',
    category: 'healing',
    power: 60,
    effect: 'Restores 60 HP',
    description: 'Restores 60 HP to a Pokémon',
    canUseInBattle: true
  },
  {
    id: 'hyper-potion',
    name: 'Hyper Potion',
    category: 'healing',
    power: 120,
    effect: 'Restores 120 HP',
    description: 'Restores 120 HP to a Pokémon',
    canUseInBattle: true
  },
  {
    id: 'max-potion',
    name: 'Max Potion',
    category: 'healing',
    power: 999,
    effect: 'Fully restores HP',
    description: 'Fully restores the HP of a Pokémon',
    canUseInBattle: true
  },
  {
    id: 'full-restore',
    name: 'Full Restore',
    category: 'healing',
    power: 999,
    effect: 'Fully restores HP and heals status',
    description: 'Fully restores the HP and heals any status conditions',
    canUseInBattle: true
  }
];

export const STATUS_ITEMS: BattleItem[] = [
  {
    id: 'full-heal',
    name: 'Full Heal',
    category: 'status',
    effect: 'Heals all status conditions',
    description: 'Heals all status conditions of a Pokémon',
    canUseInBattle: true
  },
  {
    id: 'antidote',
    name: 'Antidote',
    category: 'status',
    effect: 'Cures poison',
    description: 'Cures a Pokémon of poison',
    canUseInBattle: true
  },
  {
    id: 'burn-heal',
    name: 'Burn Heal',
    category: 'status',
    effect: 'Cures burn',
    description: 'Cures a Pokémon of a burn',
    canUseInBattle: true
  },
  {
    id: 'ice-heal',
    name: 'Ice Heal',
    category: 'status',
    effect: 'Cures freeze',
    description: 'Cures a Pokémon of freeze',
    canUseInBattle: true
  },
  {
    id: 'paralyze-heal',
    name: 'Paralyze Heal',
    category: 'status',
    effect: 'Cures paralysis',
    description: 'Cures a Pokémon of paralysis',
    canUseInBattle: true
  },
  {
    id: 'awakening',
    name: 'Awakening',
    category: 'status',
    effect: 'Wakes up sleeping Pokémon',
    description: 'Wakes up a sleeping Pokémon',
    canUseInBattle: true
  }
];

export const BERRIES: BattleItem[] = [
  {
    id: 'oran-berry',
    name: 'Oran Berry',
    category: 'berry',
    power: 10,
    effect: 'Restores 10 HP when HP is low',
    description: 'A Berry to be consumed by Pokémon. If a Pokémon holds one, it restores 10 HP',
    canUseInBattle: false
  },
  {
    id: 'sitrus-berry',
    name: 'Sitrus Berry',
    category: 'berry',
    power: 30,
    effect: 'Restores 25% HP when HP drops below 50%',
    description: 'A Berry to be consumed by Pokémon. If a Pokémon holds one, it restores 25% of max HP',
    canUseInBattle: false
  },
  {
    id: 'lum-berry',
    name: 'Lum Berry',
    category: 'berry',
    effect: 'Cures any status condition',
    description: 'A Berry to be consumed by Pokémon. If a Pokémon holds one, it cures any status condition',
    canUseInBattle: false
  },
  {
    id: 'chesto-berry',
    name: 'Chesto Berry',
    category: 'berry',
    effect: 'Wakes up sleeping Pokémon',
    description: 'A Berry to be consumed by Pokémon. If a Pokémon holds one, it wakes from sleep',
    canUseInBattle: false
  },
  {
    id: 'rawst-berry',
    name: 'Rawst Berry',
    category: 'berry',
    effect: 'Cures burn',
    description: 'A Berry to be consumed by Pokémon. If a Pokémon holds one, it recovers from a burn',
    canUseInBattle: false
  },
  {
    id: 'pecha-berry',
    name: 'Pecha Berry',
    category: 'berry',
    effect: 'Cures poison',
    description: 'A Berry to be consumed by Pokémon. If a Pokémon holds one, it recovers from poison',
    canUseInBattle: false
  }
];

export const HELD_ITEMS: BattleItem[] = [
  {
    id: 'life-orb',
    name: 'Life Orb',
    category: 'held',
    effect: 'Boosts move power by 30% but costs 10% HP per attack',
    description: 'An item to be held by a Pokémon. It boosts the power of moves, but at the cost of some HP',
    canUseInBattle: false
  },
  {
    id: 'choice-band',
    name: 'Choice Band',
    category: 'held',
    effect: 'Boosts Attack by 50% but locks into first move used',
    description: 'An item to be held by a Pokémon. It boosts Attack but allows only one move to be used',
    canUseInBattle: false
  },
  {
    id: 'choice-specs',
    name: 'Choice Specs',
    category: 'held',
    effect: 'Boosts Special Attack by 50% but locks into first move used',
    description: 'An item to be held by a Pokémon. It boosts Sp. Atk but allows only one move to be used',
    canUseInBattle: false
  },
  {
    id: 'choice-scarf',
    name: 'Choice Scarf',
    category: 'held',
    effect: 'Boosts Speed by 50% but locks into first move used',
    description: 'An item to be held by a Pokémon. It boosts Speed but allows only one move to be used',
    canUseInBattle: false
  },
  {
    id: 'leftovers',
    name: 'Leftovers',
    category: 'held',
    effect: 'Restores 1/16 of max HP each turn',
    description: 'An item to be held by a Pokémon. The holder gradually regains HP during battle',
    canUseInBattle: false
  },
  {
    id: 'assault-vest',
    name: 'Assault Vest',
    category: 'held',
    effect: 'Boosts Special Defense by 50% but prevents status moves',
    description: 'An item to be held by a Pokémon. It boosts Sp. Def but prevents status moves',
    canUseInBattle: false
  },
  {
    id: 'focus-sash',
    name: 'Focus Sash',
    category: 'held',
    effect: 'Survives a OHKO with 1 HP if at full HP',
    description: 'An item to be held by a Pokémon. If it has full HP, it endures a potential KO with 1 HP',
    canUseInBattle: false
  },
  {
    id: 'weakness-policy',
    name: 'Weakness Policy',
    category: 'held',
    effect: 'Sharply raises Attack and Sp. Atk when hit by a super effective move',
    description: 'An item to be held by a Pokémon. Attack and Sp. Atk sharply increase if hit by a super effective move',
    canUseInBattle: false
  }
];

export const ALL_ITEMS: BattleItem[] = [
  ...HEALING_ITEMS,
  ...STATUS_ITEMS,
  ...BERRIES,
  ...HELD_ITEMS
];

export function getItemById(id: string): BattleItem | undefined {
  return ALL_ITEMS.find(item => item.id === id);
}

export function getRandomBerry(): BattleItem {
  return BERRIES[Math.floor(Math.random() * BERRIES.length)];
}

export function getRandomHeldItem(): BattleItem {
  return HELD_ITEMS[Math.floor(Math.random() * HELD_ITEMS.length)];
}

// Starting items for player
export const STARTER_ITEMS: BattleItem[] = [
  { ...HEALING_ITEMS[0] }, // Potion x5
  { ...HEALING_ITEMS[0] },
  { ...HEALING_ITEMS[0] },
  { ...HEALING_ITEMS[0] },
  { ...HEALING_ITEMS[0] },
  { ...HEALING_ITEMS[1] }, // Super Potion x3
  { ...HEALING_ITEMS[1] },
  { ...HEALING_ITEMS[1] },
  { ...STATUS_ITEMS[0] }, // Full Heal x2
  { ...STATUS_ITEMS[0] }
];
