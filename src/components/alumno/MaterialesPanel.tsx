import { useEffect, useRef, useState } from "react";
import { archivoService } from "../../services/archivoService";
import type { Archivo } from "../../types";
import "./MaterialesPanel.css";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFecha(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  aulaId: string;
}

/** Panel de materiales: listado + subida + descarga de archivos (HU-07/08). */
export function MaterialesPanel({ aulaId }: Props) {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    archivoService
      .list(aulaId)
      .then(setArchivos)
      .catch(() => setError("No se pudieron cargar los archivos."))
      .finally(() => setLoading(false));
  }, [aulaId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const nuevo = await archivoService.upload(aulaId, file);
      setArchivos((prev) => [nuevo, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDownload(arch: Archivo) {
    setDownloadingId(arch.id);
    try {
      await archivoService.download(aulaId, arch.id, arch.nombreOriginal);
    } catch {
      setError("No se pudo descargar el archivo.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="mat-panel">
      <div className="mat-panel__toolbar">
        <label
          className={`mat-panel__upload-btn ${uploading ? "is-loading" : ""}`}
          aria-disabled={uploading}
        >
          {uploading ? "Subiendo…" : "Subir archivo"}
          <input
            ref={inputRef}
            type="file"
            hidden
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
        <p className="mat-panel__hint">Máximo 20 MB por archivo.</p>
      </div>

      {error && <p className="mat-panel__error">{error}</p>}

      {loading ? (
        <p className="mat-panel__muted">Cargando archivos…</p>
      ) : archivos.length === 0 ? (
        <p className="mat-panel__muted">No hay archivos subidos aún.</p>
      ) : (
        <ul className="mat-panel__list">
          {archivos.map((arch) => (
            <li key={arch.id} className="mat-item">
              <div className="mat-item__icon" aria-hidden="true" />
              <div className="mat-item__info">
                <span className="mat-item__name">{arch.nombreOriginal}</span>
                <span className="mat-item__meta">
                  {formatBytes(arch.tamanio)} · {arch.subidoPorNombre} ·{" "}
                  {formatFecha(arch.createdAt)}
                </span>
              </div>
              <button
                className="mat-item__dl-btn"
                disabled={downloadingId === arch.id}
                onClick={() => handleDownload(arch)}
                title="Descargar"
              >
                {downloadingId === arch.id ? "…" : "Descargar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
