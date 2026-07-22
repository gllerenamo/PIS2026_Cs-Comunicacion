import { useCallback, useEffect, useState } from "react";
import { AulaSelect } from "../../components/profesor/AulaSelect";
import { comunicacionService } from "../../services/comunicacionService";
import type { ForoHilo, ForoMensaje } from "../../types";
import "./docencia.css";

interface Props {
  /** Si se indica, el foro trabaja sobre esa aula y se oculta el selector. */
  aulaId?: string;
  /** Modo incrustado (pestaña del aula): sin cabecera ni migas. */
  embedded?: boolean;
}

/** HU-37 · Foro de discusión del aula: hilos y respuestas (profesor y alumno). */
export function ForosPage({ aulaId: aulaFija, embedded = false }: Props = {}) {
  const [aulaSel, setAulaSel] = useState("");
  const aulaId = aulaFija ?? aulaSel;
  const [hilos, setHilos] = useState<ForoHilo[]>([]);
  const [nuevoHilo, setNuevoHilo] = useState("");
  const [abierto, setAbierto] = useState<ForoHilo | null>(null);
  const [mensajes, setMensajes] = useState<ForoMensaje[]>([]);
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState("");

  const cargarHilos = useCallback(() => {
    if (!aulaId) return;
    setError("");
    comunicacionService
      .listHilos(aulaId)
      .then(setHilos)
      .catch(() => setError("No se pudieron cargar los hilos."));
  }, [aulaId]);

  useEffect(() => {
    setAbierto(null);
    cargarHilos();
  }, [cargarHilos]);

  function abrir(h: ForoHilo) {
    setAbierto(h);
    comunicacionService
      .listMensajesHilo(h.id)
      .then(setMensajes)
      .catch(() => setError("No se pudieron cargar los mensajes."));
  }

  async function crearHilo() {
    if (!nuevoHilo.trim()) return;
    try {
      await comunicacionService.crearHilo(aulaId, nuevoHilo);
      setNuevoHilo("");
      cargarHilos();
    } catch {
      setError("No se pudo abrir el hilo.");
    }
  }

  async function responder() {
    if (!abierto || !respuesta.trim()) return;
    try {
      const m = await comunicacionService.responderHilo(abierto.id, respuesta);
      setMensajes((prev) => [...prev, m]);
      setRespuesta("");
      cargarHilos();
    } catch {
      setError("No se pudo enviar la respuesta.");
    }
  }

  return (
    <div className="doc">
      {!embedded && (
        <>
          <p className="doc__breadcrumb">Inicio › Comunicación › Foros</p>
          <header className="doc__head">
            <div>
              <h1 className="doc__title">Foro de discusión</h1>
              <p className="doc__subtitle">{hilos.length} hilo(s) activo(s)</p>
            </div>
          </header>
        </>
      )}

      <div className="doc__toolbar">
        {!aulaFija && <AulaSelect value={aulaId} onChange={setAulaSel} />}
        <input
          className="doc-input"
          style={{ margin: 0, maxWidth: 320 }}
          placeholder="Abrir nuevo hilo…"
          value={nuevoHilo}
          onChange={(e) => setNuevoHilo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && crearHilo()}
        />
        <button className="doc-btn" onClick={crearHilo} disabled={!aulaId}>
          Abrir hilo
        </button>
      </div>

      {error && <p className="doc-error">{error}</p>}

      {abierto ? (
        <>
          <button
            className="doc-btn doc-btn--ghost"
            style={{ marginBottom: 12 }}
            onClick={() => setAbierto(null)}
          >
            ‹ Volver a los hilos
          </button>
          <div className="doc-card__title" style={{ marginBottom: 10 }}>
            {abierto.titulo}
          </div>
          <div className="doc-chat__thread" style={{ marginBottom: 12 }}>
            {mensajes.map((m) => (
              <div key={m.id} className="doc-bubble doc-bubble--in">
                <strong>{m.autorNombre}</strong>
                <br />
                {m.texto}
              </div>
            ))}
          </div>
          <div className="doc-chat__compose" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <input
              placeholder="Escribe una respuesta…"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && responder()}
            />
            <button className="doc-btn" onClick={responder}>
              Enviar
            </button>
          </div>
        </>
      ) : hilos.length === 0 ? (
        <p className="doc-muted">No hay hilos en esta aula. Abre el primero.</p>
      ) : (
        hilos.map((h) => (
          <div key={h.id} className="doc-hilo" onClick={() => abrir(h)}>
            <div>
              <div className="doc-card__title">{h.titulo}</div>
              <div className="doc-card__meta">Abierto por {h.autorNombre}</div>
            </div>
            <span className="doc-chip doc-chip--warn">{h.respuestas} respuesta(s)</span>
          </div>
        ))
      )}
    </div>
  );
}
