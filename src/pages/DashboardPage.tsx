import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./DashboardPage.css";

/** Panel de inicio tras autenticarse. El contenido se adapta al rol. */
export function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const canManageAulas = user.role === "ADMIN" || user.role === "PROFESOR";

  return (
    <div className="dash">
      <header className="dash__header">
        <h1 className="dash__title">Hola, {user.nombres} 👋</h1>
        <p className="dash__subtitle">
          Bienvenido al Sistema de Seguimiento de Practicantes.
        </p>
      </header>

      <section className="dash__cards">
        {canManageAulas && (
          <article className="dash-card">
            <h3 className="dash-card__title">Clases y prácticas</h3>
            <p className="dash-card__text">
              Crea y administra las aulas de prácticas pre-profesionales.
            </p>
            <Link to="/aulas" className="dash-card__action">
              Gestionar clases →
            </Link>
          </article>
        )}

        <article className="dash-card">
          <h3 className="dash-card__title">Asistencia</h3>
          <p className="dash-card__text">
            Registro cronológico de ingresos y salidas de los practicantes.
          </p>
          <span className="dash-card__soon">Próximamente</span>
        </article>

        <article className="dash-card">
          <h3 className="dash-card__title">Informes</h3>
          <p className="dash-card__text">
            Carga y seguimiento de informes semanales de prácticas.
          </p>
          <span className="dash-card__soon">Próximamente</span>
        </article>
      </section>
    </div>
  );
}
