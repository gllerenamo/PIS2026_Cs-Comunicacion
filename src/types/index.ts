/**
 * Tipos del dominio del SSP (Sistema de Seguimiento de Practicantes).
 * Reflejan los contratos de la API REST definidos en
 * SSP_ARQ_ArquitecturaDelSistema_V1.0 (sección 7).
 */

/** Roles del sistema (RBAC sobre JWT). */
export type Role = "ADMIN" | "PROFESOR" | "ALUMNO";

/** Usuario autenticado. */
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  role: Role;
}

/** Respuesta de POST /api/v1/auth/login. */
export interface LoginResponse {
  token: string;
  user: User;
}

/** Payload de registro de cuenta (HU-3). */
export interface RegisterPayload {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  role: Role;
  /** Código universitario / CUI (opcional para perfiles externos). */
  codigo?: string;
}

/** Estado de una clase/práctica. */
export type AulaEstado = "ACTIVA" | "CONCLUIDA";

/** Clase / práctica gestionada por un profesor (HU-4). */
export interface Aula {
  id: string;
  nombre: string;
  /** Código del curso o de la práctica (ej. "PP-2026-I"). */
  codigo: string;
  descripcion: string;
  /** Periodo académico, ej. "2026-I". */
  periodo: string;
  profesorId: string;
  profesorNombre: string;
  estado: AulaEstado;
  /** Nro. de alumnos/practicantes inscritos. */
  inscritos: number;
  createdAt: string;
}

/** Payload para crear una clase/práctica (HU-4). */
export interface CreateAulaPayload {
  nombre: string;
  codigo: string;
  descripcion: string;
  periodo: string;
}

/** Vista de un aula desde la perspectiva del alumno inscrito (HU-05). */
export interface AulaAlumno {
  id: string;
  nombre: string;
  profesorNombre: string;
  /** Ciclo académico, ej. "2024-II". */
  ciclo: string;
  estado: AulaEstado;
  /** Avance de la práctica, 0–100. */
  progreso: number;
  semanaActual: number;
  semanasTotales: number;
}

/** Estado de un ítem de actividad reciente. */
export type ActividadEstado = "PENDIENTE" | "SIN_LEER" | "CALIFICADA";

/** Ítem del feed de actividad reciente del alumno (HU-05). */
export interface ActividadReciente {
  id: string;
  titulo: string;
  contexto: string;
  tiempo: string;
  estado: ActividadEstado;
}

/** Error normalizado que emite la capa de servicios. */
export interface ApiError {
  status: number;
  message: string;
}
