import { useEffect, useState } from "react";
import { tareaService } from "../../services/tareaService";
import type { Calificaciones } from "../../types";
import "./NotasPanel.css";

function formatFecha(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ESTADO_LABEL: Record<string, string> = {
  CALIFICADA: "Calificada",
  ENTREGADA: "Entregada",
  PENDIENTE: "Pendiente",
};

interface Props {
  aulaId: string;
}

/** Panel de calificaciones del alumno (HU-10). */
export function NotasPanel({ aulaId }: Props) {
  const [cal, setCal] = useState<Calificaciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    tareaService
      .getCalificaciones(aulaId)
      .then(setCal)
      .catch(() => setError("No se pudieron cargar las calificaciones."))
      .finally(() => setLoading(false));
  }, [aulaId]);

  if (loading) return <p className="notas-panel__muted">Cargando calificaciones…</p>;
  if (error) return <p className="notas-panel__error">{error}</p>;
  if (!cal) return null;

  return (
    <div className="notas-panel">
      {/* Métricas resumen */}
      <div className="notas-metrics">
        <div className="notas-metric-card">
          <p className="notas-metric-card__value">
            {cal.promedio !== null ? `${cal.promedio}/20` : "—"}
          </p>
          <p className="notas-metric-card__label">Promedio</p>
        </div>
        <div className="notas-metric-card">
          <p className="notas-metric-card__value">{cal.tareasEntregadas}</p>
          <p className="notas-metric-card__label">Tareas entregadas</p>
        </div>
        <div className="notas-metric-card">
          <p className="notas-metric-card__value">
            {cal.tareasEntregadas}/{cal.tareasTotal}
          </p>
          <p className="notas-metric-card__label">Completadas</p>
        </div>
      </div>

      {/* Tabla detallada */}
      {cal.detalle.length === 0 ? (
        <p className="notas-panel__muted">No hay tareas registradas.</p>
      ) : (
        <div className="notas-table-wrap">
          <table className="notas-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Estado</th>
                <th>Nota</th>
                <th>Entregada</th>
                <th>Retroalimentación</th>
              </tr>
            </thead>
            <tbody>
              {cal.detalle.map((d) => (
                <tr key={d.tareaId}>
                  <td className="notas-table__titulo">{d.tareaTitulo}</td>
                  <td>
                    <span
                      className={`badge badge--${d.estado.toLowerCase()}`}
                    >
                      {ESTADO_LABEL[d.estado] ?? d.estado}
                    </span>
                  </td>
                  <td className="notas-table__nota">
                    {d.nota !== null ? `${d.nota}/20` : "—"}
                  </td>
                  <td className="notas-table__fecha">
                    {formatFecha(d.entregadaEn)}
                  </td>
                  <td className="notas-table__retro">
                    {d.retroalimentacion ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
