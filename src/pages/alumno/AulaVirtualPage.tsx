import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { StepTabs } from "../../components/alumno/StepTabs";
import { alumnoService } from "../../services/alumnoService";
import { useAuth } from "../../hooks/useAuth";
import type { AulaAlumno } from "../../types";
import "./AulaVirtualPage.css";

const TABS = [
  "Materiales",
  "Tareas",
  "Foro",
  "Bitácora",
  "Notas",
  "Mensajes",
] as const;
type Tab = (typeof TABS)[number];

const TAB_PLACEHOLDER: Record<Tab, string> = {
  Materiales: "Los materiales del aula aparecerán aquí cuando el profesor los publique.",
  Tareas: "Las tareas para entregar aparecerán aquí. (Disponible en HU-07)",
  Foro: "El foro de discusión estará disponible próximamente.",
  Bitácora: "El registro de actividades estará disponible próximamente.",
  Notas: "Las calificaciones estarán disponibles aquí cuando sean publicadas.",
  Mensajes: "Los mensajes del profesor aparecerán aquí próximamente.",
};

/** HU-06 · Aula virtual con 6 pestañas. */
export function AulaVirtualPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aula, setAula] = useState<AulaAlumno | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Materiales");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    alumnoService
      .getAulaDetalle(id, user)
      .then(setAula)
      .catch(() => navigate("/mis-aulas", { replace: true }))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) return <p className="aula-v__loading">Cargando aula…</p>;
  if (!aula) return null;

  return (
    <div className="aula-v">
      <p className="aula-v__breadcrumb">
        Inicio › <Link to="/mis-aulas">Mis aulas</Link> › {aula.nombre}
      </p>

      <StepTabs current={2} />

      <header className="aula-v__head">
        <h1 className="aula-v__title">{aula.nombre}</h1>
        <p className="aula-v__meta">
          {aula.profesorNombre} · Ciclo {aula.ciclo} · Semana {aula.semanaActual}{" "}
          de {aula.semanasTotales} · Avance {aula.progreso}%
        </p>
      </header>

      <div className="aula-v__progress-wrap">
        <div
          className="aula-v__progress-bar"
          style={{ width: `${aula.progreso}%` }}
        />
      </div>

      <nav className="aula-v__tabs" role="tablist" aria-label="Secciones del aula">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`aula-v__tab ${activeTab === tab ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="aula-v__panel" role="tabpanel">
        <p className="aula-v__placeholder">{TAB_PLACEHOLDER[activeTab]}</p>
      </section>
    </div>
  );
}
