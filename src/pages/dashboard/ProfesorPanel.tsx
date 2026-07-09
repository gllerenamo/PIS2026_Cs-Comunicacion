import { useEffect, useState } from "react";
import { panelService } from "../../services/panelService";
import type { AlumnoEnRiesgo, ResumenProfesor, User } from "../../types";
import { StatTile } from "./StatTile";
import "../practicas.css";
import "./dashboard-panels.css";

/** HU-22 · Panel de control del profesor: seguimiento y priorización de acciones. */
export function ProfesorPanel({ user }: { user: User }) {
  const [resumen, setResumen] = useState<ResumenProfesor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    panelService
      .getResumenProfesor(user)
      .then(setResumen)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Panel de control del profesor</h1>
          <p className="pg__subtitle">
            Hola, {user.nombres} — un vistazo rápido a tus aulas de prácticas.
          </p>
        </div>
      </header>

      {loading || !resumen ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : (
        <>
          <div className="stat-grid">
            <StatTile label="Alumnos activos" value={resumen.alumnosActivos} />
            <StatTile label="Entregas pendientes" value={resumen.entregasPendientes} />
            <StatTile
              label="Asistencia promedio"
              value={
                resumen.asistenciaPromedio === null ? "—" : `${resumen.asistenciaPromedio}%`
              }
              hint={resumen.asistenciaPromedio === null ? "Sin registros de asistencia" : undefined}
            />
            <StatTile label="Alumnos en riesgo" value={resumen.alumnosEnRiesgo.length} />
          </div>

          <div className="card">
            <h2 className="card__title">Alumnos en riesgo</h2>
            {resumen.alumnosEnRiesgo.length === 0 ? (
              <p className="pg__subtitle">Ningún practicante presenta señales de riesgo.</p>
            ) : (
              <ul className="riesgo-list">
                {resumen.alumnosEnRiesgo.map((r: AlumnoEnRiesgo) => (
                  <li key={r.practicanteId} className="riesgo-item">
                    <div className="riesgo-item__nombre">{r.practicanteNombre}</div>
                    <div className="riesgo-item__motivos">
                      {r.motivos.map((m) => (
                        <span key={m} className="badge badge--warning">
                          {m}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
