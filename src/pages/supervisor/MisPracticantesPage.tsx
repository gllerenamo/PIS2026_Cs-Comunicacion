import { useEffect, useState } from "react";
import { supervisorService } from "../../services/supervisorService";
import type { PracticanteCentro } from "../../types";
import "../profesor/docencia.css";

const ESTADO_TXT: Record<string, string> = {
  EN_CURSO: "En curso",
  LISTA_PARA_CIERRE: "Lista para cierre",
  CERRADA: "Cerrada",
};

/** HU-39 · Practicantes asignados al centro de prácticas (supervisor). */
export function MisPracticantesPage() {
  const [lista, setLista] = useState<PracticanteCentro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supervisorService
      .listPracticantes()
      .then(setLista)
      .catch(() => setError("No se pudieron cargar los practicantes."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="doc-muted">Cargando practicantes…</p>;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Mis practicantes</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Practicantes asignados</h1>
          <p className="doc__subtitle">
            {lista.length} practicante(s) en tu centro de prácticas
          </p>
        </div>
      </header>

      {error && <p className="doc-error">{error}</p>}
      {lista.length === 0 ? (
        <p className="doc-muted">Aún no hay practicantes asignados a tu centro.</p>
      ) : (
        lista.map((p) => {
          const pct = Math.min(
            100,
            Math.round((p.horasAcumuladas / p.horasMinimas) * 100),
          );
          return (
            <div key={p.practicaId} className="doc-card">
              <div className="doc-card__row">
                <div>
                  <div className="doc-card__title">{p.practicanteNombre}</div>
                  <div className="doc-card__meta">
                    {p.email} · {p.aulaNombre} · {p.periodo}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {p.horasPendientes > 0 && (
                    <span className="doc-chip doc-chip--warn">
                      {p.horasPendientes} registro(s) por validar
                    </span>
                  )}
                  {p.evaluacionPendiente && (
                    <span className="doc-chip doc-chip--bad">Evaluación pendiente</span>
                  )}
                  <span className="doc-chip doc-chip--ok">
                    {ESTADO_TXT[p.estado] ?? p.estado}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div className="doc-card__meta">
                  {p.horasAcumuladas} de {p.horasMinimas} horas ({pct}%)
                </div>
                <div className="doc-bar" style={{ marginTop: 6 }}>
                  <div className="doc-bar__fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
