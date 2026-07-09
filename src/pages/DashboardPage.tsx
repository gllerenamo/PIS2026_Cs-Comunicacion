import { useAuth } from "../hooks/useAuth";
import { ProfesorPanel } from "./dashboard/ProfesorPanel";
import { AdminPanel } from "./dashboard/AdminPanel";
import { EmpresaPanel } from "./dashboard/EmpresaPanel";
import "./DashboardPage.css";

/** Panel de inicio tras autenticarse. El contenido se adapta al rol (HU-22/23/24). */
export function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "PROFESOR") return <ProfesorPanel user={user} />;
  if (user.role === "ADMIN") return <AdminPanel user={user} />;
  if (user.role === "SUPERVISOR") return <EmpresaPanel user={user} />;

  return (
    <div className="dash">
      <header className="dash__header">
        <h1 className="dash__title">Hola, {user.nombres} 👋</h1>
        <p className="dash__subtitle">
          Bienvenido al Sistema de Seguimiento de Practicantes.
        </p>
      </header>

      <section className="dash__cards">
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
