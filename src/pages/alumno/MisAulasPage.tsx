import { useEffect, useState } from "react";
import { StepTabs } from "../../components/alumno/StepTabs";
import { alumnoService } from "../../services/alumnoService";
import { useAuth } from "../../hooks/useAuth";
import type { ActividadEstado, ActividadReciente, AulaAlumno } from "../../types";
import "./MisAulasPage.css";

const ACTIVIDAD_LABEL: Record<ActividadEstado, string> = {
  PENDIENTE: "Pendiente",
  SIN_LEER: "Sin leer",
  CALIFICADA: "Calificada",
};

/** HU-05 · Acceso y vista de clases programadas (Mis aulas del alumno). */
export function MisAulasPage() {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<AulaAlumno[]>([]);
  const [actividad, setActividad] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      alumnoService.listMisAulas(user),
      alumnoService.listActividadReciente(user),
    ])
      .then(([as, act]) => {
        setAulas(as);
        setActividad(act);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const activas = aulas.filter((a) => a.estado === "ACTIVA").length;
  const concluidas = aulas.filter((a) => a.estado === "CONCLUIDA").length;
  const ciclo = aulas.find((a) => a.estado === "ACTIVA")?.ciclo ?? aulas[0]?.ciclo;

  return (
    <div className="aulas-al">
      <p className="aulas-al__breadcrumb">Inicio › Mis aulas</p>
      <StepTabs current={1} />

      <header className="aulas-al__head">
        <h1 className="aulas-al__title">Mis aulas virtuales</h1>
        {!loading && (
          <p className="aulas-al__summary">
            Ciclo {ciclo} — {activas} aula{activas === 1 ? "" : "s"} activa
            {activas === 1 ? "" : "s"}, {concluidas} concluida
            {concluidas === 1 ? "" : "s"}
          </p>
        )}
      </header>

      {loading ? (
        <p className="aulas-al__loading">Cargando tus aulas…</p>
      ) : (
        <section className="aulas-al__grid">
          {aulas.map((aula) => (
            <article key={aula.id} className="aula-al-card">
              <div className="aula-al-card__top">
                <span className="aula-al-card__icon" aria-hidden="true" />
                <div>
                  <h3 className="aula-al-card__name">{aula.nombre}</h3>
                  <p className="aula-al-card__prof">{aula.profesorNombre}</p>
                </div>
              </div>

              {aula.estado === "ACTIVA" ? (
                <>
                  <div className="aula-al-card__progress">
                    <div
                      className="aula-al-card__progress-bar"
                      style={{ width: `${aula.progreso}%` }}
                    />
                  </div>
                  <p className="aula-al-card__meta">
                    Avance: {aula.progreso}% — Sem. {aula.semanaActual} de{" "}
                    {aula.semanasTotales}
                  </p>
                  <span className="badge badge--activa">Activa</span>
                  <button className="aula-al-card__cta" disabled title="Disponible en HU-06">
                    Ingresar al aula
                  </button>
                </>
              ) : (
                <>
                  <div className="aula-al-card__progress">
                    <div
                      className="aula-al-card__progress-bar is-done"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <p className="aula-al-card__meta">Completada — Ciclo {aula.ciclo}</p>
                  <span className="badge badge--concluida">Concluida</span>
                  <button className="aula-al-card__cta is-ghost" disabled title="Próximamente">
                    Ver historial
                  </button>
                </>
              )}
            </article>
          ))}
        </section>
      )}

      <section className="aulas-al__activity">
        <h2 className="aulas-al__activity-title">Actividad reciente</h2>
        <ul className="activity-list">
          {actividad.map((item) => (
            <li key={item.id} className="activity-item">
              <div>
                <p className="activity-item__title">{item.titulo}</p>
                <p className="activity-item__ctx">{item.contexto}</p>
              </div>
              <span className={`badge badge--${item.estado.toLowerCase()}`}>
                {ACTIVIDAD_LABEL[item.estado]}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
