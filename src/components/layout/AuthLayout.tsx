import type { ReactNode } from "react";
import { Logo } from "../Logo";
import "./AuthLayout.css";

/**
 * Layout de pantalla dividida para las páginas de autenticación
 * (login, registro, recuperar contraseña). Panel de marca a la izquierda,
 * formulario a la derecha.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__brand-top">
          <Logo variant="light" />
        </div>
        <div className="auth__brand-body">
          <h2 className="auth__brand-title">
            Gestión integral de prácticas pre-profesionales
          </h2>
          <p className="auth__brand-text">
            Plataforma de la Escuela Profesional de Ingeniería de Sistemas para
            el registro de asistencia, informes y seguimiento de practicantes
            conforme al reglamento RCU 0501-2020.
          </p>
        </div>
        <p className="auth__brand-foot">UNSA · FIPS · 2026</p>
      </aside>

      <main className="auth__panel">
        <div className="auth__card">
          <header className="auth__header">
            <h1 className="auth__title">{title}</h1>
            {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          </header>
          {children}
          {footer && <div className="auth__footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
