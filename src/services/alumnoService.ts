import type { ActividadReciente, AulaAlumno, User } from "../types";
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
};
