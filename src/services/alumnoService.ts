import type { ActividadReciente, AulaAlumno, User } from "../types";
import { delay } from "./apiClient";

/**
 * Servicio de la experiencia del alumno (HU-05+).
 * Datos mock que replican los contratos de la API para la vista del practicante.
 */

const MIS_AULAS: AulaAlumno[] = [
  {
    id: "a-1",
    nombre: "Práctica Pre-profesional I",
    profesorNombre: "Mg. Torres Villarreal",
    ciclo: "2024-II",
    estado: "ACTIVA",
    progreso: 65,
    semanaActual: 9,
    semanasTotales: 16,
  },
  {
    id: "a-prev",
    nombre: "Práctica Pre-profesional II",
    profesorNombre: "Lic. Mamani Cárdenas",
    ciclo: "2024-I",
    estado: "CONCLUIDA",
    progreso: 100,
    semanaActual: 16,
    semanasTotales: 16,
  },
];

const ACTIVIDAD: ActividadReciente[] = [
  {
    id: "act-1",
    titulo: "Informe semanal N.° 9 publicado",
    contexto: "Práctica Pre-profesional I — hace 2 horas",
    tiempo: "hace 2 horas",
    estado: "PENDIENTE",
  },
  {
    id: "act-2",
    titulo: "Nuevo mensaje del profesor",
    contexto: "Mg. Torres Villarreal — ayer",
    tiempo: "ayer",
    estado: "SIN_LEER",
  },
  {
    id: "act-3",
    titulo: "Tarea N.° 8 calificada: 17/20",
    contexto: "Práctica I — hace 3 días",
    tiempo: "hace 3 días",
    estado: "CALIFICADA",
  },
];

export const alumnoService = {
  /** Lista las aulas en las que el alumno está inscrito. */
  async listMisAulas(_user: User): Promise<AulaAlumno[]> {
    void _user;
    return delay(MIS_AULAS);
  },

  /** Feed de actividad reciente del alumno. */
  async listActividadReciente(_user: User): Promise<ActividadReciente[]> {
    void _user;
    return delay(ACTIVIDAD, 300);
  },
};
