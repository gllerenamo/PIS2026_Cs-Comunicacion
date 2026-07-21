import { http } from "./apiClient";
import type {
  CompletarEvaluacionPayload,
  EvaluacionDetalle,
  PracticanteCentro,
  RegistroHorasEstado,
  RegistroValidacion,
} from "../types";

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
};
