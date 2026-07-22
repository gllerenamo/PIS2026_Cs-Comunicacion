import { useEffect, useState } from "react";
import { alumnoService } from "../../services/alumnoService";
import type { ResumenCalificaciones } from "../../types";
import "../profesor/docencia.css";

const fmt = (n: number | null) => (n == null ? "—" : String(n));

const ESTADO_CHIP: Record<string, string> = {
  CALIFICADA: "doc-chip--ok",
  ENTREGADA: "doc-chip--warn",
  PENDIENTE: "doc-chip--bad",
};
const ESTADO_TXT: Record<string, string> = {
  CALIFICADA: "Calificada",
  ENTREGADA: "Entregada",
  PENDIENTE: "Pendiente",
};

/** HU-45 · Consulta general de calificaciones del practicante. */
export function CalificacionesPage() {
  const [data, setData] = useState<ResumenCalificaciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    alumnoService
      .getCalificaciones()
      .then(setData)
      .catch(() => setError("No se pudieron cargar tus calificaciones."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="doc-muted">Cargando calificaciones…</p>;
  if (error) return <p className="doc-error">{error}</p>;
  if (!data) return null;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Mi práctica › Calificaciones</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Mis calificaciones</h1>
          <p className="doc__subtitle">
            {data.aulas.length} aula(s) · Promedio general {fmt(data.promedioGeneral)} / 20
          </p>
        </div>
      </header>

      {data.aulas.length === 0 ? (
        <p className="doc-muted">Aún no estás matriculado en ninguna aula.</p>
      ) : (
        data.aulas.map((a) => (
          <section key={a.aulaId} style={{ marginBottom: 22 }}>
            <div className="doc-card__row" style={{ marginBottom: 10 }}>
              <div>
                <div className="doc-card__title">{a.aulaNombre}</div>
                <div className="doc-card__meta">
                  Periodo {a.periodo} · {a.tareasEntregadas} de {a.tareasTotal} tareas
                  entregadas
                </div>
              </div>
              <span className="doc-chip doc-chip--ok">
                Promedio {fmt(a.promedio)} / 20
              </span>
            </div>

            {a.detalle.length === 0 ? (
              <p className="doc-muted">Esta aula aún no tiene tareas publicadas.</p>
            ) : (
              <div className="doc-tablewrap">
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Tarea</th>
                      <th className="doc-table__num">Estado</th>
                      <th className="doc-table__num">Nota</th>
                      <th>Retroalimentación del docente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.detalle.map((d) => (
                      <tr key={d.tareaId}>
                        <td>{d.tareaTitulo}</td>
                        <td className="doc-table__num">
                          <span className={`doc-chip ${ESTADO_CHIP[d.estado] ?? ""}`}>
                            {ESTADO_TXT[d.estado] ?? d.estado}
                          </span>
                        </td>
                        <td className="doc-table__num">{fmt(d.nota)}</td>
                        <td>{d.retroalimentacion ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
