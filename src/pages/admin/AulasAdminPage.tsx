import { useEffect, useState } from "react";
import { aulaService } from "../../services/aulaService";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../hooks/useAuth";
import type { Aula, UsuarioAdmin } from "../../types";
import "../profesor/docencia.css";

/** HU-29 + HU-30 · Gestión de aulas: archivar/reactivar y asignar profesor. */
export function AulasAdminPage() {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [profesores, setProfesores] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([aulaService.list(user), adminService.listUsuarios()])
      .then(([as, us]) => {
        setAulas(as);
        setProfesores(us.filter((u) => u.role === "PROFESOR"));
      })
      .catch(() => setError("No se pudieron cargar las aulas."))
      .finally(() => setLoading(false));
  }, [user]);

  async function toggleEstado(aula: Aula) {
    setBusy(aula.id);
    setError("");
    try {
      const nuevo = aula.estado === "ACTIVA" ? "CONCLUIDA" : "ACTIVA";
      const upd = await adminService.cambiarEstadoAula(aula.id, nuevo);
      setAulas((prev) => prev.map((a) => (a.id === aula.id ? upd : a)));
    } catch {
      setError("No se pudo cambiar el estado del aula.");
    } finally {
      setBusy("");
    }
  }

  async function cambiarProfesor(aula: Aula, profesorId: string) {
    setBusy(aula.id);
    setError("");
    try {
      const upd = await adminService.asignarProfesor(aula.id, profesorId);
      setAulas((prev) => prev.map((a) => (a.id === aula.id ? upd : a)));
    } catch {
      setError("No se pudo asignar el profesor.");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <p className="doc-muted">Cargando aulas…</p>;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Panel › Gestión › Aulas virtuales</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Aulas virtuales</h1>
          <p className="doc__subtitle">
            {aulas.length} aulas · {aulas.filter((a) => a.estado === "ACTIVA").length} activas
          </p>
        </div>
      </header>

      {error && <p className="doc-error">{error}</p>}

      <div className="doc-tablewrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Aula</th>
              <th>Código</th>
              <th>Periodo</th>
              <th>Profesor jefe</th>
              <th className="doc-table__num">Inscritos</th>
              <th className="doc-table__num">Estado</th>
              <th style={{ textAlign: "right" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {aulas.map((a) => (
              <tr key={a.id}>
                <td>{a.nombre}</td>
                <td>{a.codigo}</td>
                <td>{a.periodo}</td>
                <td>
                  <select
                    className="doc-select"
                    value={a.profesorId}
                    disabled={busy === a.id}
                    onChange={(e) => cambiarProfesor(a, e.target.value)}
                  >
                    {profesores.every((p) => p.id !== a.profesorId) && (
                      <option value={a.profesorId}>{a.profesorNombre}</option>
                    )}
                    {profesores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombres} {p.apellidos}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="doc-table__num">{a.inscritos}</td>
                <td className="doc-table__num">
                  <span
                    className={`doc-chip ${a.estado === "ACTIVA" ? "doc-chip--ok" : "doc-chip--warn"}`}
                  >
                    {a.estado === "ACTIVA" ? "Activa" : "Concluida"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="doc-btn doc-btn--ghost"
                    onClick={() => toggleEstado(a)}
                    disabled={busy === a.id}
                  >
                    {a.estado === "ACTIVA" ? "Archivar" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
