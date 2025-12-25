// Theme Configuration - White/Purple (Light) & Purple/Black (Dark)
// Inspired by modern Pokemon sites like pokemondb.net

export const lightTheme = {
  name: 'light',
  colors: {
    // Primary - Purple tones (main brand color)
    primary: '#7C3AED',           // Vibrant Purple
    primaryDark: '#6D28D9',       // Darker Purple
    primaryLight: '#8B5CF6',      // Light Purple
    primaryGlow: 'rgba(124, 58, 237, 0.15)',

    // Background - Clean white
    bgPrimary: '#FFFFFF',
    bgSecondary: '#FAFAFB',
    bgTertiary: '#F4F4F5',
    bgCard: '#FFFFFF',
    bgHover: '#F4F4F5',
    bgGlass: 'rgba(255, 255, 255, 0.9)',

    // Text
    textPrimary: '#18181B',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',
    textInverse: '#FFFFFF',

    // Accents
    accent1: '#7C3AED',           // Purple
    accent2: '#EC4899',           // Pink
    accent3: '#F59E0B',           // Amber/Gold
    accent4: '#10B981',           // Emerald

    // Borders & Shadows
    border: '#E4E4E7',
    borderLight: '#F4F4F5',
    borderFocus: '#7C3AED',
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowHover: 'rgba(124, 58, 237, 0.15)',
    shadowCard: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Specific UI elements
    navBg: '#FFFFFF',
    navBorder: '#E4E4E7',
    cardBg: '#FFFFFF',
    inputBg: '#FFFFFF',
    buttonPrimaryBg: '#7C3AED',
    buttonSecondaryBg: '#F4F4F5',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)',
    secondary: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    card: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFB 100%)',
    hero: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #C026D3 100%)',
    glow: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
  }
};

export const darkTheme = {
  name: 'dark',
  colors: {
    // Primary - Lighter Purple for dark backgrounds
    primary: '#A78BFA',           // Light Purple
    primaryDark: '#8B5CF6',       // Medium Purple
    primaryLight: '#C4B5FD',      // Very Light Purple
    primaryGlow: 'rgba(167, 139, 250, 0.2)',

    // Background - Deep purple-black
    bgPrimary: '#09090B',         // Almost black
    bgSecondary: '#18181B',       // Dark zinc
    bgTertiary: '#1F1B2E',        // Dark purple tint
    bgCard: '#18181B',
    bgHover: '#27272A',
    bgGlass: 'rgba(24, 24, 27, 0.9)',

    // Text
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    textInverse: '#18181B',

    // Accents
    accent1: '#A78BFA',           // Light Purple
    accent2: '#F472B6',           // Pink
    accent3: '#FBBF24',           // Amber/Gold
    accent4: '#34D399',           // Emerald

    // Borders & Shadows
    border: '#27272A',
    borderLight: '#3F3F46',
    borderFocus: '#A78BFA',
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowHover: 'rgba(167, 139, 250, 0.25)',
    shadowCard: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',

    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Specific UI elements
    navBg: '#09090B',
    navBorder: '#27272A',
    cardBg: '#18181B',
    inputBg: '#27272A',
    buttonPrimaryBg: '#7C3AED',
    buttonSecondaryBg: '#27272A',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #C026D3 100%)',
    secondary: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
    card: 'linear-gradient(180deg, #18181B 0%, #1F1B2E 100%)',
    hero: 'linear-gradient(135deg, #581C87 0%, #7C3AED 50%, #A855F7 100%)',
    glow: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
  }
};

export type Theme = typeof lightTheme;

// Type colors (consistent across themes)
export const typeColors: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// Stat colors for charts
export const statColors = {
  hp: '#EF4444',
  attack: '#F97316',
  defense: '#EAB308',
  specialAttack: '#3B82F6',
  specialDefense: '#22C55E',
  speed: '#EC4899',
};

// Tier colors for competitive
export const tierColors = {
  uber: '#FF0000',
  ou: '#F59E0B',
  uu: '#3B82F6',
  ru: '#22C55E',
  nu: '#A855F7',
  pu: '#EC4899',
  untiered: '#6B7280',
};
