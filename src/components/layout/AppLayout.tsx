import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { Role } from "../../types";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import "./AppLayout.css";

interface NavItem {
  to: string;
  label: string;
  /** Si está deshabilitado, se muestra pero aún no es navegable (pantalla pendiente). */
  enabled?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Navegación por rol. Las pantallas aún no implementadas van como `enabled: false`. */
const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  ALUMNO: [
    {
      title: "Principal",
      items: [
        { to: "/dashboard", label: "Inicio", enabled: true },
        { to: "/mis-aulas", label: "Mis aulas", enabled: true },
      ],
    },
    {
      title: "Mi práctica",
      items: [
        { to: "/empresa", label: "Mi empresa", enabled: true },
        { to: "/horas", label: "Horas acumuladas", enabled: true },
        { to: "/metas", label: "Metas por practicante", enabled: true },
        { to: "/reporte", label: "Reporte final", enabled: true },
        { to: "/bitacora", label: "Mi bitácora" },
        { to: "/calificaciones", label: "Calificaciones" },
      ],
    },
    {
      title: "Comunicación",
      items: [
        { to: "/mensajeria", label: "Mensajería" },
        { to: "/foros", label: "Foros" },
      ],
    },
    {
      title: "Cuenta",
      items: [{ to: "/perfil", label: "Mi perfil" }],
    },
  ],
  PROFESOR: [
    {
      title: "Principal",
      items: [
        { to: "/dashboard", label: "Inicio", enabled: true },
        { to: "/aulas", label: "Clases y prácticas", enabled: true },
        { to: "/progreso", label: "Progreso practicantes", enabled: true },
      ],
    },
    {
      title: "Seguimiento",
      items: [
        { to: "/cierre", label: "Cierre y validación", enabled: true },
        { to: "/historial", label: "Historial de practicantes", enabled: true },
        { to: "/metas", label: "Metas por practicante", enabled: true },
        { to: "/reporte", label: "Reporte final", enabled: true },
      ],
    },
  ],
  ADMIN: [
    {
      title: "Principal",
      items: [
        { to: "/dashboard", label: "Inicio", enabled: true },
        { to: "/aulas", label: "Clases y prácticas", enabled: true },
        { to: "/progreso", label: "Progreso practicantes", enabled: true },
        { to: "/usuarios", label: "Gestión de usuarios", enabled: true },
      ],
    },
    {
      title: "Seguimiento",
      items: [
        { to: "/cierre", label: "Cierre y validación", enabled: true },
        { to: "/historial", label: "Historial de practicantes", enabled: true },
        { to: "/metas", label: "Metas por practicante", enabled: true },
        { to: "/reporte", label: "Reporte final", enabled: true },
      ],
    },
  ],
  SUPERVISOR: [
    {
      title: "Principal",
      items: [{ to: "/dashboard", label: "Inicio", enabled: true }],
    },
  ],
};

/** Shell de la aplicación: cabecera de marca (guinda) + barra lateral agrupada. */
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const groups = NAV_BY_ROLE[user.role];
  const initials =
    `${user.nombres[0] ?? ""}${user.apellidos[0] ?? ""}`.toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shell">
      <header className="shell__topbar">
        <div className="shell__brand">
          <span className="shell__brand-name">PrácticasCC</span>
          <span className="shell__brand-sub">Ciencias de la Comunicación</span>
        </div>
        <div className="shell__user">
          <NotificationBell />
          <span className="shell__user-name">
            {user.nombres} {user.apellidos}
          </span>
          <span className="shell__avatar">{initials}</span>
          <button className="shell__logout" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>

      <div className="shell__body">
        <aside className="shell__sidebar">
          {groups.map((group) => (
            <div key={group.title} className="shell__nav-group">
              <p className="shell__nav-title">{group.title}</p>
              {group.items.map((item) =>
                item.enabled ? (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `shell__nav-link ${isActive ? "is-active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <span
                    key={item.to}
                    className="shell__nav-link is-disabled"
                    title="Próximamente"
                  >
                    {item.label}
                  </span>
                ),
              )}
            </div>
          ))}
        </aside>

        <main className="shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
