import { http } from "./apiClient";
import type {
  AsistenciaItem,
  AsistenciaSesion,
  EntregaProfesor,
  LibroCalificaciones,
  PracticanteProgreso,
  Seguimiento,
} from "../types";

export const profesorService = {
  /** GET /api/v1/profesor/practicantes — lista practicantes con progreso. */
  async listPracticantes(): Promise<PracticanteProgreso[]> {
    return http<PracticanteProgreso[]>("/api/v1/profesor/practicantes");
  },

  /* ── HU-25 · Asistencia ─────────────────────────────────────────────── */

  /** GET asistencia del aula en una fecha (YYYY-MM-DD). */
  async getAsistencia(aulaId: string, fecha: string): Promise<AsistenciaSesion> {
    return http<AsistenciaSesion>(
      `/api/v1/profesor/aulas/${aulaId}/asistencia?fecha=${fecha}`,
    );
  },

  /** POST guarda (reemplaza) la asistencia del aula para una fecha. */
  async guardarAsistencia(
    aulaId: string,
    fecha: string,
    items: Pick<AsistenciaItem, "practicanteId" | "presente">[],
  ): Promise<AsistenciaSesion> {
    return http<AsistenciaSesion>(`/api/v1/profesor/aulas/${aulaId}/asistencia`, {
      method: "POST",
      body: { fecha, items },
    });
  },

  /* ── HU-26 · Entregas ───────────────────────────────────────────────── */

  /** GET todas las entregas de las tareas del aula. */
  async listEntregas(aulaId: string): Promise<EntregaProfesor[]> {
    return http<EntregaProfesor[]>(`/api/v1/profesor/aulas/${aulaId}/entregas`);
  },

  /** PUT asigna nota (0–20) y retroalimentación a una entrega. */
  async calificarEntrega(
    entregaId: string,
    nota: number,
    retroalimentacion: string,
  ): Promise<EntregaProfesor> {
    return http<EntregaProfesor>(
      `/api/v1/profesor/entregas/${entregaId}/calificar`,
      { method: "PUT", body: { nota, retroalimentacion } },
    );
  },

  /* ── HU-27 · Libro de calificaciones ────────────────────────────────── */

  async getLibro(aulaId: string): Promise<LibroCalificaciones> {
    return http<LibroCalificaciones>(`/api/v1/profesor/aulas/${aulaId}/libro`);
  },

  /* ── HU-28 · Seguimiento individual ─────────────────────────────────── */

  async getSeguimiento(aulaId: string, alumnoId: string): Promise<Seguimiento> {
    return http<Seguimiento>(
      `/api/v1/profesor/aulas/${aulaId}/practicantes/${alumnoId}/seguimiento`,
    );
  },
};
