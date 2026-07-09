import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useThemePreference } from "../../hooks/useThemePreference";
import type { ThemeName } from "../../hooks/useThemePreference";
import "./UserMenu.css";

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: "azul", label: "Azul clásico" },
  { value: "granate", label: "Granate" },
];

/** Menú de usuario: selección de tema y cierre de sesión. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useThemePreference();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const initials = `${user.nombres[0] ?? ""}${user.apellidos[0] ?? ""}`.toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menú de usuario"
      >
        <span className="app__avatar">{initials}</span>
        <span className="app__user-name">
          {user.nombres} {user.apellidos}
        </span>
      </button>

      {open && (
        <div className="user-menu__panel">
          <div className="user-menu__section">
            <span className="user-menu__label">Tema</span>
            <div className="user-menu__theme-options">
              {THEME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`user-menu__theme-btn ${theme === o.value ? "is-active" : ""}`}
                  onClick={() => setTheme(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <button className="user-menu__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
