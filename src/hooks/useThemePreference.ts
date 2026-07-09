import { useEffect, useState } from "react";

export type ThemeName = "granate" | "azul";

const THEME_KEY = "ssp.theme";

function readStoredTheme(): ThemeName {
  return localStorage.getItem(THEME_KEY) === "granate" ? "granate" : "azul";
}

/** Preferencia de tema de color (granate institucional o azul clásico), persistida en localStorage. */
export function useThemePreference() {
  const [theme, setTheme] = useState<ThemeName>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
