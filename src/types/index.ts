/**
 * Tipos del dominio del SSP (Sistema de Seguimiento de Practicantes).
 * Reflejan los contratos de la API REST definidos en
 * SSP_ARQ_ArquitecturaDelSistema_V1.0 (sección 7).
 */

/** Roles del sistema (RBAC sobre JWT). */
export type Role = "ADMIN" | "PROFESOR" | "ALUMNO" | "SUPERVISOR";

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
  /** Vincula este contacto con una cuenta de login (rol SUPERVISOR, HU-24). */
  userId?: string;
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

/** Estado de validación de un registro de horas por el supervisor externo (HU-24). */
export type RegistroHorasEstado = "PENDIENTE" | "VALIDADO" | "RECHAZADO";

/** Registro individual de horas trabajadas (bitácora). */
export interface RegistroHoras {
  id: string;
  practicaId: string;
  fecha: string;
  horas: number;
  descripcion: string;
  estadoValidacion: RegistroHorasEstado;
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

/* ============================================================
 * HU-20 · Gestión de metas por practicante
 * ============================================================ */

/** Tipo de producto periodístico sobre el que se mide una meta. */
export type MetaTipo = "ARTICULOS" | "NOTAS_PERIODISTICAS" | "NOTAS_PRENSA" | "HORAS";

/** Meta cuantitativa definida por el asesor para medir el avance real de un practicante. */
export interface Meta {
  id: string;
  practicaId: string;
  practicanteId: string;
  practicanteNombre: string;
  tipo: MetaTipo;
  cantidadObjetivo: number;
  cantidadAlcanzada: number;
  descripcion?: string;
  creadoPor: string;
  fechaCreacion: string;
}

export interface CreateMetaPayload {
  tipo: MetaTipo;
  cantidadObjetivo: number;
  descripcion?: string;
}

export interface RegistrarAvanceMetaPayload {
  cantidad: number;
}

/* ============================================================
 * HU-22 · Panel de control del profesor (asistencia de soporte)
 * ============================================================ */

/** Registro de asistencia diaria de un practicante a su aula/práctica. */
export interface RegistroAsistencia {
  id: string;
  practicanteId: string;
  aulaId: string;
  fecha: string;
  presente: boolean;
}

/* ============================================================
 * HU-24 · Panel de control de empresa (supervisor externo)
 * ============================================================ */

/** Estado de la evaluación de desempeño de un practicante por su supervisor externo. */
export type EvaluacionEstado = "PENDIENTE" | "COMPLETADA";

export interface Evaluacion {
  id: string;
  practicaId: string;
  practicanteId: string;
  practicanteNombre: string;
  empresaId: string;
  periodo: string;
  estado: EvaluacionEstado;
  fechaLimite: string;
}

/** Practicante con señales de riesgo detectadas por el panel del profesor. */
export interface AlumnoEnRiesgo {
  practicanteId: string;
  practicanteNombre: string;
  motivos: string[];
}

/** Panel de control del profesor (HU-22). */
export interface ResumenProfesor {
  alumnosActivos: number;
  entregasPendientes: number;
  asistenciaPromedio: number | null;
  alumnosEnRiesgo: AlumnoEnRiesgo[];
}

/** Panel de control administrativo (HU-23). */
export interface ResumenAdmin {
  alumnosMatriculados: number;
  profesoresActivos: number;
  aulasActivas: number;
  centrosDePracticas: number;
}

/** Panel de control de empresa / supervisor externo (HU-24). */
export interface ResumenEmpresa {
  practicantesActivos: number;
  horasPorValidar: number;
  evaluacionesPendientes: number;
  cumplimientoPromedio: number | null;
}

/* ============================================================
 * HU-25 · Registro de asistencia (profesor)
 * ============================================================ */

export interface AsistenciaItem {
  practicanteId: string;
  practicanteNombre: string;
  presente: boolean;
}

export interface AsistenciaSesion {
  aulaId: string;
  fecha: string;
  items: AsistenciaItem[];
}

/* ============================================================
 * HU-26 · Revisar y calificar entregas (profesor)
 * ============================================================ */

export interface EntregaProfesor {
  id: string;
  tareaId: string;
  tareaTitulo: string;
  alumnoId: string;
  alumnoNombre: string;
  descripcion: string;
  comentario: string;
  archivoId: string | null;
  estado: string;
  nota: number | null;
  retroalimentacion: string | null;
  createdAt: string;
}

/* ============================================================
 * HU-27 · Libro de calificaciones (profesor)
 * ============================================================ */

export interface LibroTarea {
  id: string;
  titulo: string;
}

export interface LibroAlumno {
  alumnoId: string;
  alumnoNombre: string;
  codigo: string;
  /** nota por tareaId (null si no calificada). */
  notas: Record<string, number | null>;
  promedio: number | null;
  asistenciaPct: number | null;
  horas: number;
}

export interface LibroCalificaciones {
  aulaId: string;
  aulaNombre: string;
  tareas: LibroTarea[];
  alumnos: LibroAlumno[];
  promedioGeneral: number | null;
}

/* ============================================================
 * HU-28 · Seguimiento individual del practicante (profesor)
 * ============================================================ */

export interface SeguimientoEntrega {
  tareaTitulo: string;
  nota: number | null;
  estado: string;
  retroalimentacion: string | null;
}

export interface Seguimiento {
  practicanteId: string;
  practicanteNombre: string;
  practicanteEmail: string;
  aulaId: string;
  aulaNombre: string;
  empresaNombre: string | null;
  promedio: number | null;
  asistenciaPct: number | null;
  horasAcumuladas: number;
  horasMinimas: number;
  progreso: number;
  estadoPractica: string | null;
  entregas: SeguimientoEntrega[];
  motivosRiesgo: string[];
}

/* ============================================================
 * HU-31 · Matrículas (admin)
 * ============================================================ */

export interface MatriculaAlumno {
  alumnoId: string;
  alumnoNombre: string;
  email: string;
  inscrito: boolean;
}

export interface Matriculas {
  aulaId: string;
  aulaNombre: string;
  alumnos: MatriculaAlumno[];
}

/* ============================================================
 * HU-32 · Reportes institucionales (admin)
 * ============================================================ */

export interface ReporteAula {
  aulaId: string;
  aulaNombre: string;
  periodo: string;
  profesorNombre: string;
  estado: AulaEstado;
  inscritos: number;
  promedioNotas: number | null;
  asistenciaPct: number | null;
}

export interface ReporteInstitucional {
  totalAlumnos: number;
  totalProfesores: number;
  totalAulas: number;
  aulasActivas: number;
  practicasEnCurso: number;
  practicasCerradas: number;
  horasPromedio: number | null;
  aulas: ReporteAula[];
}

/* ============================================================
 * HU-33 · Auditoría (admin)
 * ============================================================ */

export interface Auditoria {
  id: string;
  userNombre: string;
  accion: string;
  detalle: string;
  fecha: string;
}

/* ============================================================
 * HU-36 · Anuncios · HU-37 Foros · HU-38 Mensajería (comunicación)
 * ============================================================ */

export interface Anuncio {
  id: string;
  aulaId: string;
  autorNombre: string;
  titulo: string;
  mensaje: string;
  fijado: boolean;
  fecha: string;
}

export interface ForoHilo {
  id: string;
  aulaId: string;
  autorNombre: string;
  titulo: string;
  respuestas: number;
  fecha: string;
}

export interface ForoMensaje {
  id: string;
  hiloId: string;
  autorNombre: string;
  texto: string;
  fecha: string;
}

export interface Contacto {
  userId: string;
  nombre: string;
  aulaId: string;
  aulaNombre: string;
  noLeidos: number;
}

export interface MensajeDirecto {
  id: string;
  remitenteId: string;
  remitenteNombre: string;
  texto: string;
  mio: boolean;
  fecha: string;
}

/* ============================================================
 * HU-39/40/41 · Supervisor del centro de prácticas
 * ============================================================ */

/** Practicante asignado al centro de prácticas del supervisor (HU-39). */
export interface PracticanteCentro {
  practicanteId: string;
  practicanteNombre: string;
  email: string;
  practicaId: string;
  aulaNombre: string;
  periodo: string;
  horasAcumuladas: number;
  horasMinimas: number;
  estado: PracticaEstado;
  horasPendientes: number;
  evaluacionPendiente: boolean;
}

/** Registro de bitácora pendiente de validación por el supervisor (HU-40). */
export interface RegistroValidacion {
  id: string;
  practicaId: string;
  practicanteNombre: string;
  fecha: string;
  horas: number;
  descripcion: string;
  estadoValidacion: RegistroHorasEstado;
}

/** Evaluación de desempeño con su rúbrica (HU-41). */
export interface EvaluacionDetalle {
  id: string;
  practicaId: string;
  practicanteNombre: string;
  periodo: string;
  estado: EvaluacionEstado;
  fechaLimite: string | null;
  puntualidad: number | null;
  responsabilidad: number | null;
  calidad: number | null;
  trabajoEquipo: number | null;
  comentario: string;
  puntaje: number | null;
}

export interface CompletarEvaluacionPayload {
  puntualidad: number;
  responsabilidad: number;
  calidad: number;
  trabajoEquipo: number;
  comentario: string;
}

/** Documento del vínculo académico con el centro (HU-42). */
export interface DocumentoCentro {
  id: string;
  categoria: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanio: number;
  subidoPorNombre: string;
  fecha: string;
}

/** Datos del centro de prácticas y de su supervisor (HU-43). */
export interface Centro {
  ruc: string;
  razonSocial: string;
  direccion: string;
  sector: string;
  telefono: string;
  email: string;
  practicantes: number;
  supervisorNombres: string;
  supervisorApellidos: string;
  supervisorCargo: string;
  supervisorEmail: string;
  supervisorTelefono: string;
}

export interface UpdateCentroPayload {
  razonSocial: string;
  direccion: string;
  sector: string;
  telefono: string;
  email: string;
}

export interface UpdateContactoPayload {
  nombres: string;
  apellidos: string;
  cargo: string;
  email: string;
  telefono: string;
}
