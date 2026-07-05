import { useRef, useState } from "react";
import { archivoService } from "../../services/archivoService";
import { tareaService } from "../../services/tareaService";
import type { TareaAlumno } from "../../types";
import "./EntregarModal.css";

interface Props {
  tarea: TareaAlumno;
  aulaId: string;
  onClose: () => void;
  onSuccess: (actualizada: TareaAlumno) => void;
}

/** Modal de entrega de tarea (HU-09). */
export function EntregarModal({ tarea, aulaId, onClose, onSuccess }: Props) {
  const [descripcion, setDescripcion] = useState("");
  const [comentario, setComentario] = useState("");
  const [archivoId, setArchivoId] = useState<string | null>(null);
  const [archivoNombre, setArchivoNombre] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const arch = await archivoService.upload(aulaId, file);
      setArchivoId(arch.id);
      setArchivoNombre(arch.nombreOriginal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError("La descripción no puede estar vacía.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const actualizada = await tareaService.submitEntrega(aulaId, tarea.id, {
        descripcion,
        comentario,
        archivoId,
      });
      onSuccess(actualizada);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la entrega.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box">
        <header className="modal-box__head">
          <h2 className="modal-box__title">Entregar tarea</h2>
          <button className="modal-box__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <p className="modal-box__tarea-titulo">{tarea.titulo}</p>
        <p className="modal-box__tarea-desc">{tarea.descripcion}</p>

        <hr className="modal-box__divider" />

        <form onSubmit={handleSubmit} className="modal-box__form">
          <label className="form-label">
            Descripción de lo realizado <span className="form-required">*</span>
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Describe las actividades que realizaste para esta tarea…"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={submitting}
          />

          <label className="form-label">Comentario adicional</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Observaciones, dificultades o notas para el profesor (opcional)…"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={submitting}
          />

          <label className="form-label">Archivo adjunto (opcional)</label>
          <div className="modal-box__upload-row">
            <label
              className={`mat-panel__upload-btn ${uploading ? "is-loading" : ""}`}
              aria-disabled={uploading}
            >
              {uploading ? "Subiendo…" : archivoNombre ? "Cambiar archivo" : "Adjuntar archivo"}
              <input
                ref={inputRef}
                type="file"
                hidden
                disabled={uploading || submitting}
                onChange={handleFile}
              />
            </label>
            {archivoNombre && (
              <span className="modal-box__file-name">{archivoNombre}</span>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-box__actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || uploading}
            >
              {submitting ? "Enviando…" : "Enviar entrega"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
