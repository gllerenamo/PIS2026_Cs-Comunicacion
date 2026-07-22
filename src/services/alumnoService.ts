import type {
  ActividadReciente,
  AulaAlumno,
  ResumenCalificaciones,
  User,
} from "../types";
import { http } from "./apiClient";

/**
 * Servicio de la experiencia del alumno (HU-05+).
 * Consume /api/v1/alumno/*. El backend identifica al alumno por el JWT.
 */
export const alumnoService = {
  /** GET /api/v1/alumno/mis-aulas — aulas inscritas del alumno con su avance. */
  async listMisAulas(user: User): Promise<AulaAlumno[]> {
    void user;
    return http<AulaAlumno[]>("/api/v1/alumno/mis-aulas");
  },

  /** GET /api/v1/alumno/actividad — feed de actividad reciente del alumno. */
  async listActividadReciente(user: User): Promise<ActividadReciente[]> {
    void user;
    return http<ActividadReciente[]>("/api/v1/alumno/actividad");
  },

  /** GET /api/v1/alumno/aulas/{id} — detalle de un aula inscrita (HU-06). */
  async getAulaDetalle(aulaId: string, user: User): Promise<AulaAlumno> {
    void user;
    return http<AulaAlumno>(`/api/v1/alumno/aulas/${aulaId}`);
  },

  /** GET /api/v1/alumno/calificaciones — consulta general de notas (HU-45). */
  async getCalificaciones(): Promise<ResumenCalificaciones> {
    return http<ResumenCalificaciones>("/api/v1/alumno/calificaciones");
  },
};
