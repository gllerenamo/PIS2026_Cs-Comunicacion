import { useEffect, useRef, useState } from "react";
import { supervisorService } from "../../services/supervisorService";
import type { DocumentoCentro } from "../../types";
import "../profesor/docencia.css";

const CATEGORIAS = [
  "Convenio",
  "Carta de presentación",
  "Plan de prácticas",
  "Constancia",
  "Otro",
];

function tamanioLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fechaLegible(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });
}

/** HU-42 · Convenio y documentos del vínculo académico con el centro. */
export function DocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoCentro[]>([]);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function cargar() {
    setError("");
    supervisorService
      .listDocumentos()
      .then(setDocumentos)
      .catch(() => setError("No se pudieron cargar los documentos."))
      .finally(() => setLoading(false));
  }

  useEffect(cargar, []);

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError("");
    try {
      const doc = await supervisorService.subirDocumento(file, categoria);
      setDocumentos((prev) => [doc, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el documento.");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function eliminar(id: string) {
    setError("");
    try {
      await supervisorService.eliminarDocumento(id);
      setDocumentos((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("No se pudo eliminar el documento.");
    }
  }

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Vínculo académico › Convenio y documentos</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Convenio y documentos</h1>
          <p className="doc__subtitle">
            {documentos.length} documento(s) del vínculo con la Escuela
          </p>
        </div>
      </header>

      <div className="doc__toolbar">
        <select
          className="doc-select"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          className="doc-btn"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
        >
          {subiendo ? "Subiendo…" : "Subir documento"}
        </button>
        <input ref={inputRef} type="file" hidden onChange={subir} />
      </div>

      {error && <p className="doc-error">{error}</p>}
      {loading ? (
        <p className="doc-muted">Cargando documentos…</p>
      ) : documentos.length === 0 ? (
        <p className="doc-muted">
          Aún no hay documentos registrados. Sube el convenio para dejarlo disponible.
        </p>
      ) : (
        documentos.map((d) => (
          <div key={d.id} className="doc-card">
            <div className="doc-card__row">
              <div>
                <div className="doc-card__title">{d.nombreOriginal}</div>
                <div className="doc-card__meta">
                  {tamanioLegible(d.tamanio)} · {d.subidoPorNombre} · {fechaLegible(d.fecha)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className="doc-chip doc-chip--ok">{d.categoria}</span>
                <button
                  className="doc-btn doc-btn--ghost"
                  onClick={() =>
                    supervisorService.descargarDocumento(d.id, d.nombreOriginal)
                  }
                >
                  Descargar
                </button>
                <button className="doc-btn doc-btn--ghost" onClick={() => eliminar(d.id)}>
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
