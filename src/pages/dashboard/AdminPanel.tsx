import { useEffect, useState } from "react";
import { panelService } from "../../services/panelService";
import type { ResumenAdmin, User } from "../../types";
import { StatTile } from "./StatTile";
import "../practicas.css";
import "./dashboard-panels.css";

/** HU-23 · Panel de control administrativo: estado general del ciclo académico. */
export function AdminPanel({ user }: { user: User }) {
  const [resumen, setResumen] = useState<ResumenAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    panelService
      .getResumenAdmin(user)
      .then(setResumen)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Panel de control administrativo</h1>
          <p className="pg__subtitle">
            Estado general del ciclo académico de prácticas pre-profesionales.
          </p>
        </div>
      </header>

      {loading || !resumen ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : (
        <div className="stat-grid">
          <StatTile label="Alumnos matriculados" value={resumen.alumnosMatriculados} />
          <StatTile label="Profesores activos" value={resumen.profesoresActivos} />
          <StatTile label="Aulas activas" value={resumen.aulasActivas} />
          <StatTile label="Centros de prácticas" value={resumen.centrosDePracticas} />
        </div>
      )}
    </div>
  );
}
