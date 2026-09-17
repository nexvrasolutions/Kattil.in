"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme?: string;
  setTheme: (theme: string | ((prev: string) => string)) => void;
  resolvedTheme?: string;
  themes: string[];
  systemTheme?: "dark" | "light";
  forcedTheme?: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
  themes: ["light", "dark"],
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  forcedTheme?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "admin_theme",
  attribute = "class",
  forcedTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(() => {
    if (forcedTheme) return forcedTheme;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) return stored;
      } catch {
        // Ignore localStorage access errors
      }
    }
    return defaultTheme;
  });

  // Sync state with localStorage on mount
  useEffect(() => {
    if (forcedTheme) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && stored !== theme) {
        setThemeState(stored);
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, [forcedTheme, storageKey]);

  // Apply theme to DOM without rendering any inline <script> tags (React 19 / Next.js 16 compatible)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const activeTheme = forcedTheme || theme;
    const root = document.documentElement;

    if (attribute === "class") {
      if (activeTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    } else {
      root.setAttribute(attribute, activeTheme);
    }

    if (!forcedTheme) {
      try {
        localStorage.setItem(storageKey, activeTheme);
      } catch {
        // Ignore localStorage access errors
      }
    }
  }, [theme, forcedTheme, attribute, storageKey]);

  const setTheme = (newTheme: string | ((prev: string) => string)) => {
    if (forcedTheme) return;
    setThemeState((prev) => {
      const next = typeof newTheme === "function" ? newTheme(prev) : newTheme;
      return next;
    });
  };

  const activeTheme = forcedTheme || theme;

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        setTheme,
        resolvedTheme: activeTheme,
        themes: ["light", "dark"],
        forcedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export default ThemeProvider;
