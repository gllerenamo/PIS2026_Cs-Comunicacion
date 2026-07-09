import { NavLink, Outlet } from "react-router-dom";
import type { Role } from "../../types";
import { Logo } from "../Logo";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../../hooks/useAuth";
import "./AppLayout.css";

interface NavItem {
  to: string;
  label: string;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Inicio" },
  { to: "/aulas", label: "Clases y prácticas", roles: ["ADMIN", "PROFESOR"] },
  { to: "/empresa", label: "Mi empresa", roles: ["ALUMNO"] },
  { to: "/horas", label: "Horas acumuladas", roles: ["ALUMNO"] },
  { to: "/cierre", label: "Cierre y validación", roles: ["ADMIN", "PROFESOR"] },
  { to: "/historial", label: "Historial de practicantes", roles: ["ADMIN", "PROFESOR"] },
  { to: "/metas", label: "Metas por practicante", roles: ["ADMIN", "PROFESOR", "ALUMNO"] },
  { to: "/reporte", label: "Reporte final", roles: ["ADMIN", "PROFESOR", "ALUMNO"] },
];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
  ALUMNO: "Alumno",
  SUPERVISOR: "Supervisor",
};

/** Shell de la aplicación autenticada: barra lateral + cabecera + contenido. */
export function AppLayout() {
  const { user } = useAuth();

  if (!user) return null;

  const visibleNav = NAV.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );

  return (
    <div className="app">
      <aside className="app__sidebar">
        <div className="app__logo">
          <Logo size="sm" />
        </div>
        <nav className="app__nav">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `app__nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app__main">
        <header className="app__topbar">
          <span className="app__role-tag">{ROLE_LABEL[user.role]}</span>
          <div className="app__user">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>

        <main className="app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
