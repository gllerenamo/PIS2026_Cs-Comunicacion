import { useCallback, useEffect, useState } from "react";
import { AulaSelect } from "../../components/profesor/AulaSelect";
import { comunicacionService } from "../../services/comunicacionService";
import type { Contacto, MensajeDirecto } from "../../types";
import "./docencia.css";

function hora(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  /** Si se indica, la mensajería trabaja sobre esa aula y se oculta el selector. */
  aulaId?: string;
  /** Modo incrustado (pestaña del aula): sin cabecera ni migas. */
  embedded?: boolean;
}

/** HU-38 · Mensajería directa profesor ↔ alumno del aula. */
export function MensajeriaPage({ aulaId: aulaFija, embedded = false }: Props = {}) {
  const [aulaSel, setAulaSel] = useState("");
  const aulaId = aulaFija ?? aulaSel;
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [activo, setActivo] = useState<Contacto | null>(null);
  const [mensajes, setMensajes] = useState<MensajeDirecto[]>([]);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");

  const cargarContactos = useCallback(() => {
    if (!aulaId) return;
    setError("");
    comunicacionService
      .listContactos(aulaId)
      .then(setContactos)
      .catch(() => setError("No se pudieron cargar los contactos."));
  }, [aulaId]);

  useEffect(() => {
    setActivo(null);
    setMensajes([]);
    cargarContactos();
  }, [cargarContactos]);

  function abrir(c: Contacto) {
    setActivo(c);
    comunicacionService
      .getConversacion(aulaId, c.userId)
      .then((ms) => {
        setMensajes(ms);
        // Al abrir, los entrantes quedan leídos: refresca el badge.
        cargarContactos();
      })
      .catch(() => setError("No se pudo cargar la conversación."));
  }

  async function enviar() {
    if (!activo || !texto.trim()) return;
    try {
      const m = await comunicacionService.enviarMensaje(aulaId, activo.userId, texto);
      setMensajes((prev) => [...prev, m]);
      setTexto("");
    } catch {
      setError("No se pudo enviar el mensaje.");
    }
  }

  return (
    <div className="doc">
      {!embedded && (
        <>
          <p className="doc__breadcrumb">Inicio › Comunicación › Mensajería</p>
          <header className="doc__head">
            <div>
              <h1 className="doc__title">Mensajería</h1>
              <p className="doc__subtitle">Conversaciones directas dentro del aula</p>
            </div>
          </header>
        </>
      )}

      {!aulaFija && (
        <div className="doc__toolbar">
          <AulaSelect value={aulaId} onChange={setAulaSel} />
        </div>
      )}

      {error && <p className="doc-error">{error}</p>}

      <div className="doc-chat">
        <div className="doc-chat__list">
          {contactos.length === 0 ? (
            <p className="doc-muted" style={{ padding: 12 }}>
              No hay contactos en esta aula.
            </p>
          ) : (
            contactos.map((c) => (
              <div
                key={c.userId}
                className={`doc-chat__contact ${activo?.userId === c.userId ? "is-active" : ""}`}
                onClick={() => abrir(c)}
              >
                <span>{c.nombre}</span>
                {c.noLeidos > 0 && <span className="doc-chat__badge">{c.noLeidos}</span>}
              </div>
            ))
          )}
        </div>

        <div className="doc-chat__panel">
          {!activo ? (
            <div className="doc-chat__thread">
              <p className="doc-muted">Selecciona un contacto para ver la conversación.</p>
            </div>
          ) : (
            <>
              <div className="doc-chat__thread">
                {mensajes.length === 0 ? (
                  <p className="doc-muted">Sin mensajes. Escribe el primero.</p>
                ) : (
                  mensajes.map((m) => (
                    <div
                      key={m.id}
                      className={`doc-bubble ${m.mio ? "doc-bubble--out" : "doc-bubble--in"}`}
                    >
                      {m.texto}
                      <span className="doc-bubble__time">{hora(m.fecha)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="doc-chat__compose">
                <input
                  placeholder="Escribe un mensaje…"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviar()}
                />
                <button className="doc-btn" onClick={enviar}>
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
