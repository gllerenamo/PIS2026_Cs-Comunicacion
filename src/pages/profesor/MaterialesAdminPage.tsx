import { useCallback, useEffect, useRef, useState } from "react";
import { AulaSelect } from "../../components/profesor/AulaSelect";
import { archivoService } from "../../services/archivoService";
import type { Archivo } from "../../types";
import "./docencia.css";

function tamanioLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** HU-35 · Gestión de materiales del aula (profesor): subir, listar y eliminar. */
export function MaterialesAdminPage() {
  const [aulaId, setAulaId] = useState("");
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const cargar = useCallback(() => {
    if (!aulaId) return;
    setLoading(true);
    setError("");
    archivoService
      .list(aulaId)
      .then(setArchivos)
      .catch(() => setError("No se pudieron cargar los materiales."))
      .finally(() => setLoading(false));
  }, [aulaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError("");
    try {
      await archivoService.upload(aulaId, file);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el material.");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function eliminar(archivoId: string) {
    setError("");
    try {
      await archivoService.remove(aulaId, archivoId);
      setArchivos((prev) => prev.filter((a) => a.id !== archivoId));
    } catch {
      setError("No se pudo eliminar el material.");
    }
  }

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Comunicación › Materiales</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Materiales del aula</h1>
          <p className="doc__subtitle">
            {archivos.length} recurso(s) publicado(s)
          </p>
        </div>
      </header>

      <div className="doc__toolbar">
        <AulaSelect value={aulaId} onChange={(id) => setAulaId(id)} />
        <button
          className="doc-btn"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo || !aulaId}
        >
          {subiendo ? "Subiendo…" : "Subir material"}
        </button>
        <input ref={inputRef} type="file" hidden onChange={subir} />
      </div>

      {error && <p className="doc-error">{error}</p>}
      {loading ? (
        <p className="doc-muted">Cargando materiales…</p>
      ) : archivos.length === 0 ? (
        <p className="doc-muted">Aún no has publicado materiales en esta aula.</p>
      ) : (
        archivos.map((a) => (
          <div key={a.id} className="doc-card">
            <div className="doc-card__row">
              <div>
                <div className="doc-card__title">{a.nombreOriginal}</div>
                <div className="doc-card__meta">
                  {tamanioLegible(a.tamanio)} · {a.subidoPorNombre}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="doc-btn doc-btn--ghost"
                  onClick={() => archivoService.download(a.aulaId, a.id, a.nombreOriginal)}
                >
                  Descargar
                </button>
                <button className="doc-btn doc-btn--ghost" onClick={() => eliminar(a.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
