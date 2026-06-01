import type { Aula, User } from "../types";

/**
 * "Base de datos" en memoria con persistencia en localStorage.
 * Simula la persistencia de PostgreSQL para el desarrollo del frontend.
 */

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = "ssp.users";
const AULAS_KEY = "ssp.aulas";

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
};

/** Genera un identificador corto único. */
export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export type { StoredUser };
