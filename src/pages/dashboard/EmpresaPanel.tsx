import { useEffect, useState } from "react";
import { panelService } from "../../services/panelService";
import type { ResumenEmpresa, User } from "../../types";
import { StatTile } from "./StatTile";
import "../practicas.css";
import "./dashboard-panels.css";

/** HU-24 · Panel de control de empresa: seguimiento desde el centro de prácticas. */
export function EmpresaPanel({ user }: { user: User }) {
  const [resumen, setResumen] = useState<ResumenEmpresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    panelService
      .getResumenEmpresa(user)
      .then(setResumen)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Panel de control de empresa</h1>
          <p className="pg__subtitle">
            Seguimiento de los practicantes a tu cargo como supervisor externo.
          </p>
        </div>
      </header>

      {loading || !resumen ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : (
        <div className="stat-grid">
          <StatTile label="Practicantes activos" value={resumen.practicantesActivos} />
          <StatTile label="Horas por validar" value={resumen.horasPorValidar} />
          <StatTile label="Evaluaciones pendientes" value={resumen.evaluacionesPendientes} />
          <StatTile
            label="Cumplimiento promedio"
            value={resumen.cumplimientoPromedio === null ? "—" : `${resumen.cumplimientoPromedio}%`}
            hint={resumen.cumplimientoPromedio === null ? "Sin practicantes asignados" : undefined}
          />
        </div>
      )}
    </div>
  );
}
