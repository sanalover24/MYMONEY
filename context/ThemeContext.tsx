import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';

// The user's chosen setting.
export type ThemeSetting = 'light' | 'dark' | 'system';
// The actual theme applied to the app.
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme; // The resolved theme ('light' or 'dark')
  themeSetting: ThemeSetting; // The user's setting ('light', 'dark', or 'system')
  setThemeSetting: (setting: ThemeSetting) => void;
  toggleTheme: () => void; // Simple toggle for layout buttons
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as ThemeSetting) || 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Listen for changes in OS theme preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Determine the final theme based on the user's setting and system preference
  const theme = useMemo<Theme>(() => {
    if (themeSetting === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return themeSetting;
  }, [themeSetting, systemPrefersDark]);

  // Apply the theme to the DOM and update meta tags
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#18181b' : '#fafafa');
  }, [theme]);

  const setThemeSetting = useCallback((setting: ThemeSetting) => {
    localStorage.setItem('theme', setting);
    setThemeSettingState(setting);
  }, []);

  // A convenient toggle for UI buttons that switches between light and dark modes
  const toggleTheme = useCallback(() => {
    // This will set the theme explicitly, overriding 'system'
    const newSetting = theme === 'light' ? 'dark' : 'light';
    setThemeSetting(newSetting);
  }, [theme, setThemeSetting]);

  const value = useMemo(() => ({ theme, themeSetting, setThemeSetting, toggleTheme }), [theme, themeSetting, setThemeSetting, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
