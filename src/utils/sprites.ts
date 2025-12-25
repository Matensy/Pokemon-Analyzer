// Pokemon Sprite Utilities
// Provides high-quality and animated sprites from various sources

export interface SpriteOptions {
  animated?: boolean;
  shiny?: boolean;
  back?: boolean;
  female?: boolean;
}

// Sprite sources
const SPRITE_SOURCES = {
  // Official PokeAPI sprites
  pokeapi: {
    base: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
    home: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home',
    dreamWorld: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world',
  },
  // Pokemon Showdown animated sprites
  showdown: {
    base: 'https://play.pokemonshowdown.com/sprites/ani',
    shiny: 'https://play.pokemonshowdown.com/sprites/ani-shiny',
    back: 'https://play.pokemonshowdown.com/sprites/ani-back',
    backShiny: 'https://play.pokemonshowdown.com/sprites/ani-back-shiny',
  },
  // Gen 5 style animated sprites
  gen5: {
    base: 'https://play.pokemonshowdown.com/sprites/gen5ani',
    shiny: 'https://play.pokemonshowdown.com/sprites/gen5ani-shiny',
  },
  // Static high quality
  static: {
    base: 'https://img.pokemondb.net/sprites/home/normal',
    shiny: 'https://img.pokemondb.net/sprites/home/shiny',
  }
};

// Convert Pokemon ID to name format for showdown sprites
function formatPokemonName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/ /g, '-')
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/:/g, '');
}

// Get animated sprite URL (Showdown format)
export function getAnimatedSprite(nameOrId: string | number, options: SpriteOptions = {}): string {
  const { shiny = false, back = false } = options;
  const name = typeof nameOrId === 'number'
    ? getPokemonNameById(nameOrId)
    : formatPokemonName(nameOrId);

  let folder = SPRITE_SOURCES.showdown.base;
  if (shiny && back) folder = SPRITE_SOURCES.showdown.backShiny;
  else if (shiny) folder = SPRITE_SOURCES.showdown.shiny;
  else if (back) folder = SPRITE_SOURCES.showdown.back;

  return `${folder}/${name}.gif`;
}

// Get Gen 5 style animated sprite
export function getGen5Sprite(nameOrId: string | number, shiny = false): string {
  const name = typeof nameOrId === 'number'
    ? getPokemonNameById(nameOrId)
    : formatPokemonName(nameOrId);

  const folder = shiny ? SPRITE_SOURCES.gen5.shiny : SPRITE_SOURCES.gen5.base;
  return `${folder}/${name}.gif`;
}

// Get high-quality static sprite (Home style)
export function getHomeSprite(id: number, shiny = false): string {
  return `${SPRITE_SOURCES.pokeapi.home}/${shiny ? 'shiny/' : ''}${id}.png`;
}

// Get official artwork
export function getOfficialArtwork(id: number, shiny = false): string {
  return `${SPRITE_SOURCES.pokeapi.artwork}/${shiny ? 'shiny/' : ''}${id}.png`;
}

// Get dream world sprite
export function getDreamWorldSprite(id: number): string {
  return `${SPRITE_SOURCES.pokeapi.dreamWorld}/${id}.svg`;
}

// Get default sprite
export function getDefaultSprite(id: number): string {
  return `${SPRITE_SOURCES.pokeapi.base}/${id}.png`;
}

// Get shiny sprite
export function getShinySprite(id: number): string {
  return `${SPRITE_SOURCES.pokeapi.base}/shiny/${id}.png`;
}

// Simple ID to name mapping for common Pokemon (for showdown sprites)
const POKEMON_NAMES: Record<number, string> = {
  1: 'bulbasaur', 2: 'ivysaur', 3: 'venusaur', 4: 'charmander', 5: 'charmeleon',
  6: 'charizard', 7: 'squirtle', 8: 'wartortle', 9: 'blastoise', 10: 'caterpie',
  25: 'pikachu', 26: 'raichu', 35: 'clefairy', 39: 'jigglypuff', 52: 'meowth',
  54: 'psyduck', 63: 'abra', 64: 'kadabra', 65: 'alakazam', 94: 'gengar',
  129: 'magikarp', 130: 'gyarados', 131: 'lapras', 133: 'eevee', 143: 'snorlax',
  144: 'articuno', 145: 'zapdos', 146: 'moltres', 150: 'mewtwo', 151: 'mew',
  // Gen 2
  152: 'chikorita', 155: 'cyndaquil', 158: 'totodile', 175: 'togepi',
  196: 'espeon', 197: 'umbreon', 243: 'raikou', 244: 'entei', 245: 'suicune',
  249: 'lugia', 250: 'ho-oh', 251: 'celebi',
  // Gen 3
  252: 'treecko', 255: 'torchic', 258: 'mudkip', 282: 'gardevoir', 384: 'rayquaza',
  386: 'deoxys',
  // Gen 4
  387: 'turtwig', 390: 'chimchar', 393: 'piplup', 445: 'garchomp', 448: 'lucario',
  483: 'dialga', 484: 'palkia', 487: 'giratina', 491: 'darkrai', 493: 'arceus',
  // Gen 5
  494: 'victini', 643: 'reshiram', 644: 'zekrom', 646: 'kyurem',
  // Gen 6
  650: 'chespin', 653: 'fennekin', 656: 'froakie', 716: 'xerneas', 717: 'yveltal',
  // Gen 7
  722: 'rowlet', 725: 'litten', 728: 'popplio', 785: 'tapu-koko', 791: 'solgaleo',
  792: 'lunala', 800: 'necrozma',
  // Gen 8
  810: 'grookey', 813: 'scorbunny', 816: 'sobble', 888: 'zacian', 889: 'zamazenta',
  890: 'eternatus',
  // Gen 9
  906: 'sprigatito', 909: 'fuecoco', 912: 'quaxly', 1007: 'koraidon', 1008: 'miraidon',
};

function getPokemonNameById(id: number): string {
  return POKEMON_NAMES[id] || `pokemon-${id}`;
}

// Get best available sprite with fallbacks
export function getBestSprite(
  id: number,
  name: string,
  options: { preferAnimated?: boolean; shiny?: boolean } = {}
): string {
  const { preferAnimated = true, shiny = false } = options;

  if (preferAnimated) {
    // Try animated first
    return getAnimatedSprite(name, { shiny });
  }

  // Fallback to home style
  return getHomeSprite(id, shiny);
}

// Sprite preloader
export function preloadSprite(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
    img.src = url;
  });
}

// Batch preload sprites
export async function preloadSprites(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(url => preloadSprite(url).catch(() => undefined)));
}

// Get sprite with error fallback
export function getSpriteWithFallback(
  primaryUrl: string,
  fallbackUrl: string
): { primary: string; fallback: string } {
  return {
    primary: primaryUrl,
    fallback: fallbackUrl,
  };
}
