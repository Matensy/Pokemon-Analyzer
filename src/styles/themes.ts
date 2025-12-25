// Custom Theme Configuration - Purple & White (Light) / Purple & Black (Dark)

export const lightTheme = {
  name: 'light',
  colors: {
    // Primary - Purple tones
    primary: '#8B5CF6',        // Vibrant Purple
    primaryDark: '#7C3AED',    // Darker Purple
    primaryLight: '#A78BFA',   // Light Purple

    // Background - White based
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F9FAFB',
    bgTertiary: '#F3F4F6',
    bgCard: '#FFFFFF',
    bgHover: '#F3F4F6',

    // Text
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // Accents
    accent1: '#8B5CF6',        // Purple
    accent2: '#EC4899',        // Pink
    accent3: '#F59E0B',        // Amber
    accent4: '#10B981',        // Green

    // Borders & Shadows
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadow: 'rgba(139, 92, 246, 0.1)',
    shadowHover: 'rgba(139, 92, 246, 0.2)',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    secondary: 'linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%)',
    card: 'linear-gradient(to bottom, #FFFFFF, #F9FAFB)',
  }
};

export const darkTheme = {
  name: 'dark',
  colors: {
    // Primary - Purple tones
    primary: '#A78BFA',        // Light Purple for dark bg
    primaryDark: '#8B5CF6',    // Medium Purple
    primaryLight: '#C4B5FD',   // Very Light Purple

    // Background - Black based with purple hints
    bgPrimary: '#0F0F0F',      // Pure Black
    bgSecondary: '#1A1625',    // Dark Purple-Black
    bgTertiary: '#231D2E',     // Lighter Purple-Black
    bgCard: '#1A1625',
    bgHover: '#2D2640',

    // Text
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',

    // Accents
    accent1: '#A78BFA',        // Light Purple
    accent2: '#F472B6',        // Pink
    accent3: '#FBBF24',        // Amber
    accent4: '#34D399',        // Green

    // Borders & Shadows
    border: '#2D2640',
    borderLight: '#3D3452',
    shadow: 'rgba(167, 139, 250, 0.2)',
    shadowHover: 'rgba(167, 139, 250, 0.3)',

    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
    secondary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    card: 'linear-gradient(to bottom, #1A1625, #231D2E)',
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
