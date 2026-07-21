import { BASE_URL, http } from "./apiClient";
import type {
  Centro,
  CompletarEvaluacionPayload,
  DocumentoCentro,
  EvaluacionDetalle,
  PracticanteCentro,
  RegistroHorasEstado,
  RegistroValidacion,
  UpdateCentroPayload,
  UpdateContactoPayload,
} from "../types";

const TOKEN_KEY = "ssp.token";

/** Cabecera de autorización para las peticiones que no pasan por `http`. */
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Vistas del supervisor del centro de prácticas: practicantes asignados (HU-39),
 * validación de horas de la bitácora (HU-40) y evaluación de desempeño (HU-41).
 * El centro se deriva del JWT en el backend.
 */
export const supervisorService = {
  /** GET practicantes del centro. */
  async listPracticantes(): Promise<PracticanteCentro[]> {
    return http<PracticanteCentro[]>("/api/v1/empresa/practicantes");
  },

  /** GET registros de horas; por defecto solo los pendientes de validar. */
  async listHoras(soloPendientes = true): Promise<RegistroValidacion[]> {
    return http<RegistroValidacion[]>(
      `/api/v1/empresa/horas?solo_pendientes=${soloPendientes}`,
    );
  },

  /** PUT valida o rechaza un registro de horas. */
  async validarHoras(
    registroId: string,
    estado: RegistroHorasEstado,
  ): Promise<RegistroValidacion> {
    return http<RegistroValidacion>(`/api/v1/empresa/horas/${registroId}`, {
      method: "PUT",
      body: { estado },
    });
  },

  /** GET evaluaciones de desempeño del centro. */
  async listEvaluaciones(): Promise<EvaluacionDetalle[]> {
    return http<EvaluacionDetalle[]>("/api/v1/empresa/evaluaciones");
  },

  /** PUT registra la rúbrica y marca la evaluación como completada. */
  async completarEvaluacion(
    evaluacionId: string,
    payload: CompletarEvaluacionPayload,
  ): Promise<EvaluacionDetalle> {
    return http<EvaluacionDetalle>(`/api/v1/empresa/evaluaciones/${evaluacionId}`, {
      method: "PUT",
      body: payload,
    });
  },

  /* ── HU-43 · Datos del centro ────────────────────────────────────────── */

  async getCentro(): Promise<Centro> {
    return http<Centro>("/api/v1/empresa/centro");
  },

  async updateCentro(payload: UpdateCentroPayload): Promise<Centro> {
    return http<Centro>("/api/v1/empresa/centro", { method: "PUT", body: payload });
  },

  async updateContacto(payload: UpdateContactoPayload): Promise<Centro> {
    return http<Centro>("/api/v1/empresa/centro/contacto", {
      method: "PUT",
      body: payload,
    });
  },

  /* ── HU-42 · Convenio y documentos ───────────────────────────────────── */

  async listDocumentos(): Promise<DocumentoCentro[]> {
    return http<DocumentoCentro[]>("/api/v1/empresa/documentos");
  },

  /** POST multipart: sube un documento del centro con su categoría. */
  async subirDocumento(file: File, categoria: string): Promise<DocumentoCentro> {
    const form = new FormData();
    form.append("file", file);
    form.append("categoria", categoria);
    const res = await fetch(`${BASE_URL}/api/v1/empresa/documentos`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) {
      let msg = "No se pudo subir el documento.";
      try {
        const d = (await res.json()) as { detail?: string };
        if (d.detail) msg = d.detail;
      } catch {
        /* sin cuerpo JSON */
      }
      throw new Error(msg);
    }
    return res.json() as Promise<DocumentoCentro>;
  },

  /** Descarga el documento y dispara el guardado en el navegador. */
  async descargarDocumento(documentoId: string, nombreOriginal: string): Promise<void> {
    const res = await fetch(
      `${BASE_URL}/api/v1/empresa/documentos/${documentoId}/descargar`,
      { headers: authHeaders() },
    );
    if (!res.ok) throw new Error("No se pudo descargar el documento.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  async eliminarDocumento(documentoId: string): Promise<void> {
    return http<void>(`/api/v1/empresa/documentos/${documentoId}`, { method: "DELETE" });
  },
};
