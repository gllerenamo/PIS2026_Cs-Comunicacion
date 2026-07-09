import type { ResumenAdmin, ResumenEmpresa, ResumenProfesor, User } from "../types";
import { http } from "./apiClient";

/**
 * Agregados de estadísticas para los paneles de control por rol:
 * profesor (HU-22), administrador (HU-23) y supervisor externo (HU-24).
 * Contra el backend FastAPI; el rol y la identidad se derivan del JWT.
 */
export const panelService = {
  async getResumenProfesor(_user: User): Promise<ResumenProfesor> {
    return http<ResumenProfesor>("/api/v1/profesor/resumen");
  },

  async getResumenAdmin(_user: User): Promise<ResumenAdmin> {
    return http<ResumenAdmin>("/api/v1/admin/resumen");
  },

  async getResumenEmpresa(_user: User): Promise<ResumenEmpresa> {
    return http<ResumenEmpresa>("/api/v1/empresa/resumen");
  },
};
