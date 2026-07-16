import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { Auditoria } from "../../types";
import "../profesor/docencia.css";

const ETIQUETA: Record<string, string> = {
  CAMBIO_ROL: "Cambio de rol",
  ESTADO_AULA: "Estado de aula",
  ASIGNAR_PROFESOR: "Asignar profesor",
  MATRICULA: "Matrícula",
  RETIRO_MATRICULA: "Retiro de matrícula",
};

function fechaLegible(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

/** HU-33 · Bitácora de auditoría de acciones administrativas. */
export function AuditoriaPage() {
  const [registros, setRegistros] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getAuditoria()
      .then(setRegistros)
      .catch(() => setError("No se pudo cargar la auditoría."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Panel › Análisis › Auditoría</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Auditoría</h1>
          <p className="doc__subtitle">
            {registros.length} acción(es) administrativa(s) registradas
          </p>
        </div>
      </header>

      {error && <p className="doc-error">{error}</p>}
      {loading ? (
        <p className="doc-muted">Cargando auditoría…</p>
      ) : registros.length === 0 ? (
        <p className="doc-muted">Aún no se registran acciones administrativas.</p>
      ) : (
        <div className="doc-tablewrap">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Responsable</th>
                <th>Acción</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{fechaLegible(r.fecha)}</td>
                  <td>{r.userNombre}</td>
                  <td>
                    <span className="doc-chip doc-chip--warn">
                      {ETIQUETA[r.accion] ?? r.accion}
                    </span>
                  </td>
                  <td>{r.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
