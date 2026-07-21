import { useEffect, useState } from "react";
import { supervisorService } from "../../services/supervisorService";
import type { EvaluacionDetalle } from "../../types";
import "../profesor/docencia.css";

/** Criterios de la rúbrica de desempeño, cada uno calificado de 0 a 20. */
const CRITERIOS = [
  { key: "puntualidad", label: "Puntualidad y asistencia" },
  { key: "responsabilidad", label: "Responsabilidad y compromiso" },
  { key: "calidad", label: "Calidad del trabajo" },
  { key: "trabajoEquipo", label: "Trabajo en equipo" },
] as const;

type CriterioKey = (typeof CRITERIOS)[number]["key"];
type Borrador = Record<CriterioKey, string> & { comentario: string };

const borradorDe = (e: EvaluacionDetalle): Borrador => ({
  puntualidad: e.puntualidad != null ? String(e.puntualidad) : "",
  responsabilidad: e.responsabilidad != null ? String(e.responsabilidad) : "",
  calidad: e.calidad != null ? String(e.calidad) : "",
  trabajoEquipo: e.trabajoEquipo != null ? String(e.trabajoEquipo) : "",
  comentario: e.comentario ?? "",
});

function fechaLegible(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });
}

/** HU-41 · Evaluación de desempeño del practicante (supervisor). */
export function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionDetalle[]>([]);
  const [borradores, setBorradores] = useState<Record<string, Borrador>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supervisorService
      .listEvaluaciones()
      .then((lista) => {
        setEvaluaciones(lista);
        const bs: Record<string, Borrador> = {};
        for (const e of lista) bs[e.id] = borradorDe(e);
        setBorradores(bs);
      })
      .catch(() => setError("No se pudieron cargar las evaluaciones."))
      .finally(() => setLoading(false));
  }, []);

  function set(id: string, campo: keyof Borrador, valor: string) {
    setBorradores((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
  }

  async function guardar(ev: EvaluacionDetalle) {
    const b = borradores[ev.id];
    const invalido = CRITERIOS.some((c) => {
      const bruto = b[c.key];
      const n = Number(bruto);
      return bruto === "" || Number.isNaN(n) || n < 0 || n > 20;
    });
    if (invalido) {
      setError(`Completa los cuatro criterios de ${ev.practicanteNombre} con valores de 0 a 20.`);
      return;
    }
    setBusy(ev.id);
    setError("");
    try {
      const upd = await supervisorService.completarEvaluacion(ev.id, {
        puntualidad: Number(b.puntualidad),
        responsabilidad: Number(b.responsabilidad),
        calidad: Number(b.calidad),
        trabajoEquipo: Number(b.trabajoEquipo),
        comentario: b.comentario,
      });
      setEvaluaciones((prev) => prev.map((e) => (e.id === ev.id ? upd : e)));
    } catch {
      setError("No se pudo guardar la evaluación.");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <p className="doc-muted">Cargando evaluaciones…</p>;

  const pendientes = evaluaciones.filter((e) => e.estado === "PENDIENTE").length;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Supervisión › Evaluaciones</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Evaluación de desempeño</h1>
          <p className="doc__subtitle">
            {evaluaciones.length} evaluación(es) · {pendientes} pendiente(s)
          </p>
        </div>
      </header>

      {error && <p className="doc-error">{error}</p>}
      {evaluaciones.length === 0 ? (
        <p className="doc-muted">No hay evaluaciones asignadas a tu centro.</p>
      ) : (
        evaluaciones.map((ev) => {
          const b = borradores[ev.id] ?? borradorDe(ev);
          const completada = ev.estado === "COMPLETADA";
          return (
            <div key={ev.id} className="doc-card">
              <div className="doc-card__row">
                <div>
                  <div className="doc-card__title">{ev.practicanteNombre}</div>
                  <div className="doc-card__meta">
                    Periodo {ev.periodo} · Fecha límite: {fechaLegible(ev.fechaLimite)}
                  </div>
                </div>
                <span className={`doc-chip ${completada ? "doc-chip--ok" : "doc-chip--warn"}`}>
                  {completada ? `Completada · ${ev.puntaje}/20` : "Pendiente"}
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
                {CRITERIOS.map((c) => (
                  <div
                    key={c.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "6px 0",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{c.label}</span>
                    <input
                      className="doc-grade__nota"
                      type="number"
                      min={0}
                      max={20}
                      placeholder="0–20"
                      value={b[c.key]}
                      onChange={(e) => set(ev.id, c.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <textarea
                className="doc-textarea"
                style={{ marginTop: 10 }}
                placeholder="Comentario sobre el desempeño del practicante…"
                value={b.comentario}
                onChange={(e) => set(ev.id, "comentario", e.target.value)}
              />

              <button
                className="doc-btn"
                onClick={() => guardar(ev)}
                disabled={busy === ev.id}
              >
                {busy === ev.id
                  ? "Guardando…"
                  : completada
                    ? "Actualizar evaluación"
                    : "Enviar evaluación"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
