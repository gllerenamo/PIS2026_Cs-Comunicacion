import { useThemePreference } from "../../hooks/useThemePreference";
import type { ThemeName } from "../../hooks/useThemePreference";

const OPTIONS: { value: ThemeName; label: string }[] = [
  { value: "granate", label: "Granate" },
  { value: "azul", label: "Azul clásico" },
];

/** Selector del tema de color de la interfaz (granate institucional o azul clásico). */
export function ThemeToggle() {
  const { theme, setTheme } = useThemePreference();

  return (
    <select
      className="theme-toggle"
      value={theme}
      onChange={(e) => setTheme(e.target.value as ThemeName)}
      aria-label="Tema de color"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
