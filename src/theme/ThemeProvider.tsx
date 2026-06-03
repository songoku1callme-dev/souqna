import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { darkTheme, lightTheme, type Theme } from './index';

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore((s) => s.themePreference);

  const theme = useMemo(() => {
    const resolved = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [themePreference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Access the active theme (colors + tokens). */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
