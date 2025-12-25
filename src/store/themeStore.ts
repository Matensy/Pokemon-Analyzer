import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lightTheme, darkTheme, Theme } from '../styles/themes';

interface ThemeStore {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: darkTheme,
      isDark: true,
      toggleTheme: () =>
        set((state) => ({
          isDark: !state.isDark,
          theme: state.isDark ? lightTheme : darkTheme,
        })),
      setTheme: (isDark: boolean) =>
        set({
          isDark,
          theme: isDark ? darkTheme : lightTheme,
        }),
    }),
    {
      name: 'pokemon-theme',
    }
  )
);
