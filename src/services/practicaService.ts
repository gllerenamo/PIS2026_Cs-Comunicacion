import type {
  Practica,
  RegistrarHorasPayload,
  RegistroHoras,
  User,
} from "../types";
import { http } from "./apiClient";

/**
 * Servicio central del ciclo de prácticas: acumulación de horas (HU-14),
 * cierre y validación docente (HU-15) e historial por practicante (HU-18).
 * Contra el backend FastAPI; el rol y la identidad se derivan del JWT.
 */
export const practicaService = {
  /** Prácticas visibles para el usuario según su rol. */
  async list(_user: User): Promise<Practica[]> {
    return http<Practica[]>("/api/v1/practicas");
  },

  /** Práctica activa (o más reciente) del practicante autenticado. */
  async getActual(_user: User): Promise<Practica | null> {
    return http<Practica | null>("/api/v1/practicas/actual");
  },

  /** Bitácora de horas registradas para una práctica (HU-14). */
  async getHoras(practicaId: string): Promise<RegistroHoras[]> {
    return http<RegistroHoras[]>(`/api/v1/practicas/${practicaId}/horas`);
  },

  /** Registra una nueva entrada de horas trabajadas (HU-14). */
  async registrarHoras(
    practicaId: string,
    payload: RegistrarHorasPayload,
  ): Promise<{ practica: Practica; registro: RegistroHoras }> {
    return http<{ practica: Practica; registro: RegistroHoras }>(
      `/api/v1/practicas/${practicaId}/horas`,
      { method: "POST", body: payload },
    );
  },

  /**
   * Cierra y valida formalmente una práctica (HU-15). Solo un docente/admin
   * puede validarla (lo impone el backend a partir del JWT).
   */
  async cerrar(practicaId: string, _docente: User): Promise<Practica> {
    return http<Practica>(`/api/v1/practicas/${practicaId}/cerrar`, {
      method: "POST",
    });
  },

  /** Historial completo de ciclos de prácticas de un practicante (HU-18). */
  async historial(practicanteId: string): Promise<Practica[]> {
    return http<Practica[]>(`/api/v1/practicas/historial/${practicanteId}`);
  },

  /** Lista de practicantes (alumnos) con al menos un ciclo registrado (HU-18). */
  async listPracticantes(): Promise<User[]> {
    return http<User[]>("/api/v1/practicas/practicantes");
  },
};
