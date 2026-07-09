import type { Notificacion, Tarea } from "../types";
import { delay } from "./apiClient";
import { db } from "./mockDb";

/**
 * Servicio de notificaciones de tareas asignadas y vencimientos próximos (HU-17).
 */
export const notificacionService = {
  /** Notificaciones del usuario autenticado, más recientes primero. */
  async list(userId: string): Promise<Notificacion[]> {
    return delay(db.getNotificacionesByUser(userId), 250);
  },

  /** Cantidad de notificaciones no leídas. */
  async unreadCount(userId: string): Promise<number> {
    const notifs = db.getNotificacionesByUser(userId);
    return delay(notifs.filter((n) => !n.leida).length, 150);
  },

  async markRead(id: string): Promise<void> {
    db.markNotificacionLeida(id);
    return delay(undefined, 100);
  },

  async markAllRead(userId: string): Promise<void> {
    db.markAllNotificacionesLeidas(userId);
    return delay(undefined, 150);
  },

  /** Tareas asignadas al practicante, ordenadas por vencimiento próximo. */
  async listTareas(practicanteId: string): Promise<Tarea[]> {
    const tareas = db
      .getTareasByPracticante(practicanteId)
      .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    return delay(tareas, 250);
  },
};
