import { http } from "./apiClient";
import type { Calificaciones, TareaAlumno } from "../types";

interface SubmitEntregaPayload {
  descripcion: string;
  comentario: string;
  archivoId?: string | null;
}

export const tareaService = {
  /** GET /api/v1/alumno/aulas/{id}/tareas — tareas con estado de entrega. */
  async listTareas(aulaId: string): Promise<TareaAlumno[]> {
    return http<TareaAlumno[]>(`/api/v1/alumno/aulas/${aulaId}/tareas`);
  },

  /** POST .../tareas/{tareaId}/entregas — envía la entrega del alumno. */
  async submitEntrega(
    aulaId: string,
    tareaId: string,
    payload: SubmitEntregaPayload
  ): Promise<TareaAlumno> {
    return http<TareaAlumno>(
      `/api/v1/alumno/aulas/${aulaId}/tareas/${tareaId}/entregas`,
      { method: "POST", body: payload }
    );
  },

  /** GET /api/v1/alumno/aulas/{id}/calificaciones — resumen de notas. */
  async getCalificaciones(aulaId: string): Promise<Calificaciones> {
    return http<Calificaciones>(`/api/v1/alumno/aulas/${aulaId}/calificaciones`);
  },
};
