import type {
  Aula,
  Empresa,
  Notificacion,
  Practica,
  RegistroHoras,
  Supervisor,
  Tarea,
  User,
} from "../types";

/**
 * "Base de datos" en memoria con persistencia en localStorage.
 * Simula la persistencia de PostgreSQL para el desarrollo del frontend.
 */

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = "ssp.users";
const AULAS_KEY = "ssp.aulas";
const EMPRESAS_KEY = "ssp.empresas";
const SUPERVISORES_KEY = "ssp.supervisores";
const PRACTICAS_KEY = "ssp.practicas";
const HORAS_KEY = "ssp.horas";
const TAREAS_KEY = "ssp.tareas";
const NOTIFICACIONES_KEY = "ssp.notificaciones";

/** Cuentas semilla para poder iniciar sesión sin registrar. */
const SEED_USERS: StoredUser[] = [
  {
    id: "u-admin",
    nombres: "Gabriel",
    apellidos: "Llerena",
    email: "admin@unsa.edu.pe",
    role: "ADMIN",
    password: "admin123",
  },
  {
    id: "u-prof",
    nombres: "Jose Luis",
    apellidos: "Cuenca",
    email: "profesor@unsa.edu.pe",
    role: "PROFESOR",
    password: "profesor123",
  },
  {
    id: "u-alumno",
    nombres: "Piero",
    apellidos: "Mejía",
    email: "alumno@unsa.edu.pe",
    role: "ALUMNO",
    password: "alumno123",
  },
];

const SEED_AULAS: Aula[] = [
  {
    id: "a-1",
    nombre: "Prácticas Pre-Profesionales I",
    codigo: "PP-2026-I",
    descripcion:
      "Seguimiento de prácticas en empresas convenio. Registro de asistencia e informes semanales.",
    periodo: "2026-I",
    profesorId: "u-prof",
    profesorNombre: "Jose Luis Cuenca",
    estado: "ACTIVA",
    inscritos: 18,
    createdAt: new Date("2026-04-01").toISOString(),
  },
  {
    id: "a-2",
    nombre: "Taller de Comunicación Audiovisual",
    codigo: "TCA-2025-II",
    descripcion: "Curso concluido del periodo anterior.",
    periodo: "2025-II",
    profesorId: "u-prof",
    profesorNombre: "Jose Luis Cuenca",
    estado: "CONCLUIDA",
    inscritos: 24,
    createdAt: new Date("2025-08-15").toISOString(),
  },
];

/** Mínimo de horas de prácticas exigido (referencial, Reglamento RCU 0501-2020). */
export const HORAS_MINIMAS_REGLAMENTO = 360;

const SEED_EMPRESAS: Empresa[] = [
  {
    id: "e-1",
    practicanteId: "u-alumno",
    razonSocial: "Radio Yaraví S.A.C.",
    ruc: "20123456789",
    direccion: "Av. Ejército 710, Yanahuara, Arequipa",
    sector: "Medios de comunicación",
    telefono: "054-254321",
    email: "contacto@radioyaravi.pe",
    fechaRegistro: new Date("2026-04-05").toISOString(),
  },
];

const SEED_SUPERVISORES: Supervisor[] = [
  {
    id: "s-1",
    empresaId: "e-1",
    nombres: "Marisol",
    apellidos: "Chávez",
    cargo: "Jefa de Prensa",
    email: "m.chavez@radioyaravi.pe",
    telefono: "954-112233",
  },
];

const SEED_PRACTICAS: Practica[] = [
  {
    id: "pr-1",
    practicanteId: "u-alumno",
    practicanteNombre: "Piero Mejía",
    aulaId: "a-1",
    aulaNombre: "Prácticas Pre-Profesionales I",
    periodo: "2026-I",
    empresaId: "e-1",
    horasAcumuladas: 148,
    horasMinimas: HORAS_MINIMAS_REGLAMENTO,
    estado: "EN_CURSO",
    fechaInicio: new Date("2026-04-01").toISOString(),
  },
  {
    id: "pr-0",
    practicanteId: "u-alumno",
    practicanteNombre: "Piero Mejía",
    aulaId: "a-2",
    aulaNombre: "Taller de Comunicación Audiovisual",
    periodo: "2025-II",
    empresaId: undefined,
    horasAcumuladas: 360,
    horasMinimas: HORAS_MINIMAS_REGLAMENTO,
    estado: "CERRADA",
    fechaInicio: new Date("2025-08-15").toISOString(),
    fechaCierre: new Date("2025-12-10").toISOString(),
    validadoPor: "Jose Luis Cuenca",
  },
];

const SEED_HORAS: RegistroHoras[] = [
  {
    id: "h-1",
    practicaId: "pr-1",
    fecha: new Date("2026-05-02").toISOString(),
    horas: 40,
    descripcion: "Producción de notas informativas semanales.",
  },
  {
    id: "h-2",
    practicaId: "pr-1",
    fecha: new Date("2026-06-01").toISOString(),
    horas: 60,
    descripcion: "Edición de contenidos para redes sociales.",
  },
  {
    id: "h-3",
    practicaId: "pr-1",
    fecha: new Date("2026-06-25").toISOString(),
    horas: 48,
    descripcion: "Cobertura de eventos institucionales.",
  },
];

const SEED_TAREAS: Tarea[] = [
  {
    id: "t-1",
    aulaId: "a-1",
    practicanteId: "u-alumno",
    titulo: "Entrega de informe mensual",
    descripcion: "Subir el informe de actividades correspondiente a junio.",
    fechaVencimiento: new Date(Date.now() + 3 * 86400000).toISOString(),
    completada: false,
  },
  {
    id: "t-2",
    aulaId: "a-1",
    practicanteId: "u-alumno",
    titulo: "Registrar horas de la última quincena",
    descripcion: "Actualizar la bitácora de horas acumuladas.",
    fechaVencimiento: new Date(Date.now() + 7 * 86400000).toISOString(),
    completada: false,
  },
];

const SEED_NOTIFICACIONES: Notificacion[] = [
  {
    id: "n-1",
    userId: "u-alumno",
    tipo: "TAREA_ASIGNADA",
    titulo: "Nueva tarea asignada",
    mensaje: "Se te asignó: Entrega de informe mensual.",
    leida: false,
    fecha: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "n-2",
    userId: "u-alumno",
    tipo: "VENCIMIENTO",
    titulo: "Vencimiento próximo",
    mensaje: "\"Entrega de informe mensual\" vence en 3 días.",
    leida: false,
    fecha: new Date().toISOString(),
  },
];

function read<T>(key: string, seed: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return [...seed];
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [...seed];
  }
}

function write<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const db = {
  /* ----- Usuarios ----- */
  getUsers(): StoredUser[] {
    return read(USERS_KEY, SEED_USERS);
  },
  findUserByEmail(email: string): StoredUser | undefined {
    return this.getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  },
  addUser(user: StoredUser): void {
    const users = this.getUsers();
    users.push(user);
    write(USERS_KEY, users);
  },
  updatePassword(email: string, password: string): boolean {
    const users = this.getUsers();
    const target = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!target) return false;
    target.password = password;
    write(USERS_KEY, users);
    return true;
  },

  /* ----- Aulas / clases ----- */
  getAulas(): Aula[] {
    return read(AULAS_KEY, SEED_AULAS);
  },
  getAulasByProfesor(profesorId: string): Aula[] {
    return this.getAulas().filter((a) => a.profesorId === profesorId);
  },
  addAula(aula: Aula): void {
    const aulas = this.getAulas();
    aulas.unshift(aula);
    write(AULAS_KEY, aulas);
  },

  /* ----- Empresas (HU-13) ----- */
  getEmpresas(): Empresa[] {
    return read(EMPRESAS_KEY, SEED_EMPRESAS);
  },
  getEmpresaByPracticante(practicanteId: string): Empresa | undefined {
    return this.getEmpresas().find((e) => e.practicanteId === practicanteId);
  },
  addEmpresa(empresa: Empresa): void {
    const empresas = this.getEmpresas();
    empresas.unshift(empresa);
    write(EMPRESAS_KEY, empresas);
  },

  /* ----- Supervisores (HU-19) ----- */
  getSupervisores(): Supervisor[] {
    return read(SUPERVISORES_KEY, SEED_SUPERVISORES);
  },
  getSupervisorByEmpresa(empresaId: string): Supervisor | undefined {
    return this.getSupervisores().find((s) => s.empresaId === empresaId);
  },
  addSupervisor(supervisor: Supervisor): void {
    const supervisores = this.getSupervisores();
    supervisores.unshift(supervisor);
    write(SUPERVISORES_KEY, supervisores);
  },

  /* ----- Prácticas: horas, cierre, historial (HU-14/15/18) ----- */
  getPracticas(): Practica[] {
    return read(PRACTICAS_KEY, SEED_PRACTICAS);
  },
  getPracticaById(id: string): Practica | undefined {
    return this.getPracticas().find((p) => p.id === id);
  },
  getPracticasByPracticante(practicanteId: string): Practica[] {
    return this.getPracticas().filter((p) => p.practicanteId === practicanteId);
  },
  getPracticasByDocente(profesorId: string): Practica[] {
    const aulaIds = this.getAulasByProfesor(profesorId).map((a) => a.id);
    return this.getPracticas().filter((p) => aulaIds.includes(p.aulaId));
  },
  updatePractica(practica: Practica): void {
    const practicas = this.getPracticas().map((p) =>
      p.id === practica.id ? practica : p,
    );
    write(PRACTICAS_KEY, practicas);
  },

  /* ----- Horas (HU-14) ----- */
  getHorasByPractica(practicaId: string): RegistroHoras[] {
    return read(HORAS_KEY, SEED_HORAS)
      .filter((h) => h.practicaId === practicaId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },
  addRegistroHoras(registro: RegistroHoras): void {
    const registros = read(HORAS_KEY, SEED_HORAS);
    registros.unshift(registro);
    write(HORAS_KEY, registros);
  },

  /* ----- Tareas (HU-17) ----- */
  getTareas(): Tarea[] {
    return read(TAREAS_KEY, SEED_TAREAS);
  },
  getTareasByPracticante(practicanteId: string): Tarea[] {
    return this.getTareas().filter((t) => t.practicanteId === practicanteId);
  },
  addTarea(tarea: Tarea): void {
    const tareas = this.getTareas();
    tareas.unshift(tarea);
    write(TAREAS_KEY, tareas);
  },

  /* ----- Notificaciones (HU-17) ----- */
  getNotificaciones(): Notificacion[] {
    return read(NOTIFICACIONES_KEY, SEED_NOTIFICACIONES);
  },
  getNotificacionesByUser(userId: string): Notificacion[] {
    return this.getNotificaciones()
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },
  addNotificacion(notificacion: Notificacion): void {
    const notifs = this.getNotificaciones();
    notifs.unshift(notificacion);
    write(NOTIFICACIONES_KEY, notifs);
  },
  markNotificacionLeida(id: string): void {
    const notifs = this.getNotificaciones().map((n) =>
      n.id === id ? { ...n, leida: true } : n,
    );
    write(NOTIFICACIONES_KEY, notifs);
  },
  markAllNotificacionesLeidas(userId: string): void {
    const notifs = this.getNotificaciones().map((n) =>
      n.userId === userId ? { ...n, leida: true } : n,
    );
    write(NOTIFICACIONES_KEY, notifs);
  },
};

/** Genera un identificador corto único. */
export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export type { StoredUser };
