import { http } from "./apiClient";
import type {
  Auditoria,
  Aula,
  AulaEstado,
  Matriculas,
  ReporteInstitucional,
  Role,
  UsuarioAdmin,
} from "../types";

export const adminService = {
  /** GET /api/v1/admin/usuarios — lista todos los usuarios. */
  async listUsuarios(): Promise<UsuarioAdmin[]> {
    return http<UsuarioAdmin[]>("/api/v1/admin/usuarios");
  },

  /** PUT /api/v1/admin/usuarios/{id}/rol — cambia el rol de un usuario. */
  async updateRol(userId: string, role: Role): Promise<UsuarioAdmin> {
    return http<UsuarioAdmin>(`/api/v1/admin/usuarios/${userId}/rol`, {
      method: "PUT",
      body: { role },
    });
  },

  /* ── HU-29 · Estado de aula ──────────────────────────────────────────── */

  async cambiarEstadoAula(aulaId: string, estado: AulaEstado): Promise<Aula> {
    return http<Aula>(`/api/v1/admin/aulas/${aulaId}/estado`, {
      method: "PUT",
      body: { estado },
    });
  },

  /* ── HU-30 · Asignar profesor ────────────────────────────────────────── */

  async asignarProfesor(aulaId: string, profesorId: string): Promise<Aula> {
    return http<Aula>(`/api/v1/admin/aulas/${aulaId}/profesor`, {
      method: "PUT",
      body: { profesorId },
    });
  },

  /* ── HU-31 · Matrículas ──────────────────────────────────────────────── */

  async getMatriculas(aulaId: string): Promise<Matriculas> {
    return http<Matriculas>(`/api/v1/admin/aulas/${aulaId}/matriculas`);
  },

  async matricular(aulaId: string, alumnoId: string): Promise<Matriculas> {
    return http<Matriculas>(`/api/v1/admin/aulas/${aulaId}/matriculas`, {
      method: "POST",
      body: { alumnoId },
    });
  },

  async desmatricular(aulaId: string, alumnoId: string): Promise<Matriculas> {
    return http<Matriculas>(`/api/v1/admin/aulas/${aulaId}/matriculas/${alumnoId}`, {
      method: "DELETE",
    });
  },

  /* ── HU-32 · Reportes ────────────────────────────────────────────────── */

  async getReportes(): Promise<ReporteInstitucional> {
    return http<ReporteInstitucional>("/api/v1/admin/reportes");
  },

  /* ── HU-33 · Auditoría ───────────────────────────────────────────────── */

  async getAuditoria(): Promise<Auditoria[]> {
    return http<Auditoria[]>("/api/v1/admin/auditoria");
  },
};
