import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeId, ThemeConfig } from './themes';
import { THEMES, detectCalendarTheme } from './themes';

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  resetToCalendar: () => void;
  isAutoTheme: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'eden-ai-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    // 1. Check localStorage for user's saved preference
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES[saved]) return saved;
    // 2. Fall back to calendar auto-detection
    return detectCalendarTheme();
  });

  const [isAutoTheme, setIsAutoTheme] = useState(() => !localStorage.getItem(STORAGE_KEY));

  // Apply CSS tokens to :root whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const config = THEMES[themeId];

    // Remove all previous theme classes from body
    Object.values(THEMES).forEach(t => document.body.classList.remove(t.bodyClass));

    // Apply new theme class and CSS tokens
    document.body.classList.add(config.bodyClass);
    Object.entries(config.tokens).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
  }, [themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    setIsAutoTheme(false);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const resetToCalendar = useCallback(() => {
    const detected = detectCalendarTheme();
    setThemeId(detected);
    setIsAutoTheme(true);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ThemeContext.Provider value={{
      themeId,
      theme: THEMES[themeId],
      setTheme,
      resetToCalendar,
      isAutoTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
