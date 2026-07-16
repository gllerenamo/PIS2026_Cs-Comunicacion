import { useCallback, useEffect, useState } from "react";
import { AulaSelect } from "../../components/profesor/AulaSelect";
import { comunicacionService } from "../../services/comunicacionService";
import type { Anuncio } from "../../types";
import "./docencia.css";

function fechaLegible(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });
}

/** HU-36 · Publicar y gestionar anuncios del aula (profesor). */
export function AnunciosPage() {
  const [aulaId, setAulaId] = useState("");
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fijado, setFijado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    if (!aulaId) return;
    setError("");
    comunicacionService
      .listAnuncios(aulaId)
      .then(setAnuncios)
      .catch(() => setError("No se pudieron cargar los anuncios."));
  }, [aulaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function publicar() {
    if (!titulo.trim() || !mensaje.trim()) {
      setError("Completa el título y el mensaje.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      await comunicacionService.crearAnuncio(aulaId, titulo, mensaje, fijado);
      setTitulo("");
      setMensaje("");
      setFijado(false);
      cargar();
    } catch {
      setError("No se pudo publicar el anuncio.");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(id: string) {
    setError("");
    try {
      await comunicacionService.eliminarAnuncio(aulaId, id);
      setAnuncios((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("No se pudo eliminar el anuncio.");
    }
  }

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Comunicación › Anuncios</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Anuncios</h1>
          <p className="doc__subtitle">{anuncios.length} anuncio(s) publicado(s)</p>
        </div>
      </header>

      <div className="doc__toolbar">
        <AulaSelect value={aulaId} onChange={(id) => setAulaId(id)} />
      </div>

      <div className="doc-form">
        <input
          className="doc-input"
          placeholder="Título del anuncio…"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <textarea
          className="doc-textarea"
          placeholder="Escribe el mensaje para los alumnos…"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <div className="doc-form__foot">
          <label className="doc-check">
            <input
              type="checkbox"
              checked={fijado}
              onChange={(e) => setFijado(e.target.checked)}
            />
            Fijar arriba
          </label>
          <button className="doc-btn" onClick={publicar} disabled={enviando || !aulaId}>
            {enviando ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>

      {error && <p className="doc-error">{error}</p>}

      {anuncios.map((a) => (
        <div key={a.id} className="doc-card">
          <div className="doc-card__row">
            <div>
              {a.fijado && <div className="doc-anuncio__pin">★ Fijado</div>}
              <div className="doc-card__title">{a.titulo}</div>
              <div className="doc-card__meta">
                {a.autorNombre} · {fechaLegible(a.fecha)}
              </div>
            </div>
            <button className="doc-btn doc-btn--ghost" onClick={() => eliminar(a.id)}>
              Eliminar
            </button>
          </div>
          <div className="doc-anuncio__msg">{a.mensaje}</div>
        </div>
      ))}
    </div>
  );
}
