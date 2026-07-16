import { useEffect, useState } from "react";
import { aulaService } from "../../services/aulaService";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../hooks/useAuth";
import type { Aula, Matriculas } from "../../types";
import "../profesor/docencia.css";

/** HU-31 · Gestión de matrículas: inscribir / retirar alumnos de un aula. */
export function MatriculasPage() {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [aulaId, setAulaId] = useState("");
  const [data, setData] = useState<Matriculas | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    aulaService
      .list(user)
      .then((as) => {
        setAulas(as);
        if (as.length > 0) setAulaId(as[0].id);
      })
      .catch(() => setError("No se pudieron cargar las aulas."));
  }, [user]);

  useEffect(() => {
    if (!aulaId) return;
    setError("");
    adminService
      .getMatriculas(aulaId)
      .then(setData)
      .catch(() => setError("No se pudieron cargar las matrículas."));
  }, [aulaId]);

  async function toggle(alumnoId: string, inscrito: boolean) {
    setBusy(alumnoId);
    setError("");
    try {
      const upd = inscrito
        ? await adminService.desmatricular(aulaId, alumnoId)
        : await adminService.matricular(aulaId, alumnoId);
      setData(upd);
    } catch {
      setError("No se pudo actualizar la matrícula.");
    } finally {
      setBusy("");
    }
  }

  const inscritos = data?.alumnos.filter((a) => a.inscrito).length ?? 0;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Panel › Gestión › Matrículas</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Matrículas</h1>
          <p className="doc__subtitle">
            {data ? `${inscritos} de ${data.alumnos.length} alumnos inscritos` : "Selecciona un aula"}
          </p>
        </div>
      </header>

      <div className="doc__toolbar">
        <select className="doc-select" value={aulaId} onChange={(e) => setAulaId(e.target.value)}>
          {aulas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} · {a.periodo}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="doc-error">{error}</p>}

      {data && (
        <div className="doc-tablewrap">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Correo</th>
                <th className="doc-table__num">Estado</th>
                <th style={{ textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.alumnos.map((a) => (
                <tr key={a.alumnoId}>
                  <td>{a.alumnoNombre}</td>
                  <td>{a.email}</td>
                  <td className="doc-table__num">
                    <span className={`doc-chip ${a.inscrito ? "doc-chip--ok" : "doc-chip--warn"}`}>
                      {a.inscrito ? "Matriculado" : "No inscrito"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className={`doc-btn ${a.inscrito ? "doc-btn--ghost" : ""}`}
                      onClick={() => toggle(a.alumnoId, a.inscrito)}
                      disabled={busy === a.alumnoId}
                    >
                      {a.inscrito ? "Retirar" : "Matricular"}
                    </button>
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
