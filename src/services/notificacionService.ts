import type { Notificacion } from "../types";
import { http } from "./apiClient";

/**
 * Servicio de notificaciones de tareas asignadas y vencimientos próximos (HU-17).
 * Contra el backend FastAPI; el usuario se deriva del JWT.
 */
export const notificacionService = {
  /** Notificaciones del usuario autenticado, más recientes primero. */
  async list(_userId: string): Promise<Notificacion[]> {
    return http<Notificacion[]>("/api/v1/notificaciones");
  },

  async markRead(id: string): Promise<void> {
    await http<void>(`/api/v1/notificaciones/${id}/read`, { method: "PUT" });
  },

  async markAllRead(_userId: string): Promise<void> {
    await http<void>("/api/v1/notificaciones/read-all", { method: "PUT" });
  },
};
