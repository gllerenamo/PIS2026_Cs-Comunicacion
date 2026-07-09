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

/** Progreso de un practicante en un aula (HU-11). */
export interface PracticanteProgreso {
  alumnoId: string;
  alumnoNombre: string;
  alumnoEmail: string;
  aulaId: string;
  aulaNombre: string;
  progreso: number;
  semanaActual: number;
  semanasTotales: number;
  estado: AulaEstado;
  tareasEntregadas: number;
  tareasTotal: number;
}

/** Usuario visto desde el panel de administración (HU-12). */
export interface UsuarioAdmin {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  role: Role;
  createdAt: string;
}

/** Estado de una entrega de tarea. */
export type EntregaEstado = "ENTREGADA" | "CALIFICADA";

/** Entrega de un alumno a una tarea (HU-09). */
export interface Entrega {
  id: string;
  tareaId: string;
  alumnoId: string;
  descripcion: string;
  comentario: string;
  archivoId: string | null;
  estado: EntregaEstado;
  nota: number | null;
  retroalimentacion: string | null;
  createdAt: string;
}

/** Tarea vista desde el alumno con su entrega (HU-09). */
export interface TareaAlumno {
  id: string;
  aulaId: string;
  titulo: string;
  descripcion: string;
  fechaLimite: string | null;
  createdAt: string;
  entrega: Entrega | null;
}

/** Detalle de una calificación (HU-10). */
export interface DetalleCalificacion {
  tareaId: string;
  tareaTitulo: string;
  nota: number | null;
  retroalimentacion: string | null;
  estado: string;
  entregadaEn: string | null;
}

/** Resumen de calificaciones del alumno en un aula (HU-10). */
export interface Calificaciones {
  promedio: number | null;
  tareasTotal: number;
  tareasEntregadas: number;
  detalle: DetalleCalificacion[];
}

/** Archivo subido a un aula (HU-07/08). */
export interface Archivo {
  id: string;
  aulaId: string;
  subidoPorId: string;
  subidoPorNombre: string;
  nombreOriginal: string;
  tipoMime: string;
  /** Tamaño en bytes. */
  tamanio: number;
  createdAt: string;
}

/** Error normalizado que emite la capa de servicios. */
export interface ApiError {
  status: number;
  message: string;
}

/* ============================================================
 * HU-13 · Registro de empresa / centro de prácticas
 * ============================================================ */

export interface Empresa {
  id: string;
  practicanteId: string;
  razonSocial: string;
  ruc: string;
  direccion: string;
  sector: string;
  telefono: string;
  email: string;
  fechaRegistro: string;
}

export interface CreateEmpresaPayload {
  razonSocial: string;
  ruc: string;
  direccion: string;
  sector: string;
  telefono: string;
  email: string;
}

/* ============================================================
 * HU-19 · Gestión del supervisor externo
 * ============================================================ */

export interface Supervisor {
  id: string;
  empresaId: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  email: string;
  telefono: string;
}

export interface CreateSupervisorPayload {
  nombres: string;
  apellidos: string;
  cargo: string;
  email: string;
  telefono: string;
}

/* ============================================================
 * HU-14 / HU-15 / HU-18 · Horas, cierre y trazabilidad
 * ============================================================ */

/** Estado del ciclo de prácticas del alumno. */
export type PracticaEstado = "EN_CURSO" | "LISTA_PARA_CIERRE" | "CERRADA";

/** Registro individual de horas trabajadas (bitácora). */
export interface RegistroHoras {
  id: string;
  practicaId: string;
  fecha: string;
  horas: number;
  descripcion: string;
}

/**
 * Ciclo de prácticas de un alumno dentro de un aula/periodo.
 * Es la entidad central para seguimiento de horas (HU-14),
 * cierre/validación (HU-15) e historial (HU-18).
 */
export interface Practica {
  id: string;
  practicanteId: string;
  practicanteNombre: string;
  aulaId: string;
  aulaNombre: string;
  periodo: string;
  empresaId?: string;
  horasAcumuladas: number;
  /** Mínimo de horas exigido (referencial, según Reglamento RCU 0501-2020). */
  horasMinimas: number;
  estado: PracticaEstado;
  fechaInicio: string;
  fechaCierre?: string;
  validadoPor?: string;
}

export interface RegistrarHorasPayload {
  horas: number;
  descripcion: string;
  fecha?: string;
}

/* ============================================================
 * HU-16 · Generación de reporte final de prácticas
 * ============================================================ */

export interface ReporteFinal {
  id: string;
  practicaId: string;
  generadoPor: string;
  generadoEn: string;
  contenido: string;
}

/* ============================================================
 * HU-17 · Notificaciones de tareas y vencimientos
 * ============================================================ */

export type NotificacionTipo = "TAREA_ASIGNADA" | "VENCIMIENTO";

export interface Notificacion {
  id: string;
  userId: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export interface Tarea {
  id: string;
  aulaId: string;
  practicanteId: string;
  titulo: string;
  descripcion: string;
  fechaVencimiento: string;
  completada: boolean;
}
