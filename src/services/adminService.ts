import { http } from "./apiClient";
import type { Role, UsuarioAdmin } from "../types";

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
};
