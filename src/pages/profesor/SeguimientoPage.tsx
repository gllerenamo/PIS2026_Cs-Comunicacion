import { useEffect, useState } from "react";
import { profesorService } from "../../services/profesorService";
import type { PracticanteProgreso, Seguimiento } from "../../types";
import "./docencia.css";

const fmt = (n: number | null) => (n == null ? "—" : String(n));

/** HU-28 · Seguimiento individual del practicante (profesor). */
export function SeguimientoPage() {
  const [practicantes, setPracticantes] = useState<PracticanteProgreso[]>([]);
  const [sel, setSel] = useState<{ aulaId: string; alumnoId: string } | null>(null);
  const [ficha, setFicha] = useState<Seguimiento | null>(null);
  const [loadingLista, setLoadingLista] = useState(true);
  const [loadingFicha, setLoadingFicha] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    profesorService
      .listPracticantes()
      .then((lista) => {
        setPracticantes(lista);
        if (lista.length > 0) setSel({ aulaId: lista[0].aulaId, alumnoId: lista[0].alumnoId });
      })
      .catch(() => setError("No se pudo cargar la lista de practicantes."))
      .finally(() => setLoadingLista(false));
  }, []);

  useEffect(() => {
    if (!sel) return;
    setLoadingFicha(true);
    profesorService
      .getSeguimiento(sel.aulaId, sel.alumnoId)
      .then(setFicha)
      .catch(() => setError("No se pudo cargar la ficha de seguimiento."))
      .finally(() => setLoadingFicha(false));
  }, [sel]);

  if (loadingLista) return <p className="doc-muted">Cargando practicantes…</p>;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Seguimiento</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Seguimiento de practicantes</h1>
          <p className="doc__subtitle">Ficha individual de avance, notas, asistencia y horas</p>
        </div>
      </header>

      {error && <p className="doc-error">{error}</p>}

      <div className="doc__toolbar">
        <select
          className="doc-select"
          value={sel ? `${sel.aulaId}|${sel.alumnoId}` : ""}
          onChange={(e) => {
            const [aulaId, alumnoId] = e.target.value.split("|");
            setSel({ aulaId, alumnoId });
          }}
        >
          {practicantes.map((p) => (
            <option key={`${p.aulaId}|${p.alumnoId}`} value={`${p.aulaId}|${p.alumnoId}`}>
              {p.alumnoNombre} · {p.aulaNombre}
            </option>
          ))}
        </select>
      </div>

      {loadingFicha || !ficha ? (
        <p className="doc-muted">Cargando ficha…</p>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <div className="doc-card__title">{ficha.practicanteNombre}</div>
            <div className="doc-card__meta">
              {ficha.practicanteEmail} · {ficha.aulaNombre}
              {ficha.empresaNombre ? ` · ${ficha.empresaNombre}` : ""}
            </div>
          </div>

          {ficha.motivosRiesgo.length > 0 && (
            <div className="doc-riesgo">
              <strong>En riesgo:</strong> {ficha.motivosRiesgo.join(" · ")}
            </div>
          )}

          <div className="doc-kpis">
            <div className="doc-kpi">
              <div className="doc-kpi__lbl">Promedio</div>
              <div className="doc-kpi__val">{fmt(ficha.promedio)}</div>
            </div>
            <div className="doc-kpi">
              <div className="doc-kpi__lbl">Asistencia</div>
              <div className="doc-kpi__val">
                {ficha.asistenciaPct == null ? "—" : `${ficha.asistenciaPct}%`}
              </div>
            </div>
            <div className="doc-kpi">
              <div className="doc-kpi__lbl">Horas</div>
              <div className="doc-kpi__val">
                {ficha.horasAcumuladas}
                <span style={{ fontSize: 13 }}>/{ficha.horasMinimas}</span>
              </div>
            </div>
            <div className="doc-kpi">
              <div className="doc-kpi__lbl">Avance</div>
              <div className="doc-kpi__val">{ficha.progreso}%</div>
            </div>
          </div>

          <div className="doc-tablewrap">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th className="doc-table__num">Estado</th>
                  <th className="doc-table__num">Nota</th>
                  <th>Retroalimentación</th>
                </tr>
              </thead>
              <tbody>
                {ficha.entregas.map((e, i) => (
                  <tr key={i}>
                    <td>{e.tareaTitulo}</td>
                    <td className="doc-table__num">
                      <span
                        className={`doc-chip ${
                          e.estado === "CALIFICADA"
                            ? "doc-chip--ok"
                            : e.estado === "ENTREGADA"
                              ? "doc-chip--warn"
                              : "doc-chip--bad"
                        }`}
                      >
                        {e.estado === "CALIFICADA"
                          ? "Calificada"
                          : e.estado === "ENTREGADA"
                            ? "Entregada"
                            : "Pendiente"}
                      </span>
                    </td>
                    <td className="doc-table__num">{fmt(e.nota)}</td>
                    <td>{e.retroalimentacion ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
