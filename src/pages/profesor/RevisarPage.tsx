import { useCallback, useEffect, useState } from "react";
import { AulaSelect } from "../../components/profesor/AulaSelect";
import { profesorService } from "../../services/profesorService";
import type { EntregaProfesor } from "../../types";
import "./docencia.css";

/** Estado local del formulario de calificación por entrega. */
interface Borrador {
  nota: string;
  retro: string;
}

/** HU-26 · Revisar y calificar entregas (profesor). */
export function RevisarPage() {
  const [aulaId, setAulaId] = useState("");
  const [entregas, setEntregas] = useState<EntregaProfesor[]>([]);
  const [borradores, setBorradores] = useState<Record<string, Borrador>>({});
  const [guardando, setGuardando] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    if (!aulaId) return;
    setLoading(true);
    setError("");
    profesorService
      .listEntregas(aulaId)
      .then((lista) => {
        setEntregas(lista);
        const bs: Record<string, Borrador> = {};
        for (const e of lista) {
          bs[e.id] = {
            nota: e.nota != null ? String(e.nota) : "",
            retro: e.retroalimentacion ?? "",
          };
        }
        setBorradores(bs);
      })
      .catch(() => setError("No se pudieron cargar las entregas."))
      .finally(() => setLoading(false));
  }, [aulaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function setBorrador(id: string, campo: keyof Borrador, valor: string) {
    setBorradores((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
  }

  async function calificar(entrega: EntregaProfesor) {
    const b = borradores[entrega.id];
    const nota = Number(b.nota);
    if (b.nota === "" || Number.isNaN(nota) || nota < 0 || nota > 20) {
      setError(`Nota inválida para ${entrega.alumnoNombre} (usa 0–20).`);
      return;
    }
    setGuardando(entrega.id);
    setError("");
    try {
      const actualizada = await profesorService.calificarEntrega(entrega.id, nota, b.retro);
      setEntregas((prev) => prev.map((e) => (e.id === entrega.id ? actualizada : e)));
    } catch {
      setError("No se pudo guardar la calificación.");
    } finally {
      setGuardando("");
    }
  }

  const pendientes = entregas.filter((e) => e.estado !== "CALIFICADA").length;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Docencia › Revisar entregas</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Revisar entregas</h1>
          <p className="doc__subtitle">
            {entregas.length > 0
              ? `${entregas.length} entregas · ${pendientes} por calificar`
              : "Selecciona un aula para ver las entregas"}
          </p>
        </div>
      </header>

      <div className="doc__toolbar">
        <AulaSelect value={aulaId} onChange={(id) => setAulaId(id)} />
      </div>

      {error && <p className="doc-error">{error}</p>}
      {loading ? (
        <p className="doc-muted">Cargando entregas…</p>
      ) : entregas.length === 0 ? (
        <p className="doc-muted">No hay entregas en esta aula todavía.</p>
      ) : (
        entregas.map((e) => {
          const calificada = e.estado === "CALIFICADA";
          const b = borradores[e.id] ?? { nota: "", retro: "" };
          return (
            <div key={e.id} className="doc-card">
              <div className="doc-card__row">
                <div>
                  <div className="doc-card__title">{e.alumnoNombre}</div>
                  <div className="doc-card__meta">{e.tareaTitulo}</div>
                </div>
                <span className={`doc-chip ${calificada ? "doc-chip--ok" : "doc-chip--warn"}`}>
                  {calificada ? `Calificada · ${e.nota}/20` : "Pendiente"}
                </span>
              </div>
              {(e.descripcion || e.comentario) && (
                <div className="doc-card__body">
                  {e.descripcion}
                  {e.comentario && (
                    <>
                      <br />
                      <em>{e.comentario}</em>
                    </>
                  )}
                </div>
              )}
              <div className="doc-grade">
                <input
                  className="doc-grade__nota"
                  type="number"
                  min={0}
                  max={20}
                  placeholder="0–20"
                  value={b.nota}
                  onChange={(ev) => setBorrador(e.id, "nota", ev.target.value)}
                />
                <textarea
                  className="doc-grade__retro"
                  placeholder="Retroalimentación para el practicante…"
                  value={b.retro}
                  onChange={(ev) => setBorrador(e.id, "retro", ev.target.value)}
                />
                <button
                  className="doc-btn"
                  onClick={() => calificar(e)}
                  disabled={guardando === e.id}
                >
                  {guardando === e.id ? "Guardando…" : calificada ? "Actualizar" : "Calificar"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
