import type {
  CreateEmpresaPayload,
  CreateSupervisorPayload,
  Empresa,
  Supervisor,
  User,
} from "../types";
import { http } from "./apiClient";

/**
 * Servicio de registro de empresa/centro de prácticas (HU-13) y de su
 * supervisor externo (HU-19). Contra el backend FastAPI; la identidad del
 * practicante se deriva del JWT, no del parámetro `user`.
 */
export const empresaService = {
  /** Empresa registrada por el practicante autenticado, si existe. */
  async getMine(_user: User): Promise<Empresa | null> {
    return http<Empresa | null>("/api/v1/empresa/mine");
  },

  /** Supervisor registrado para una empresa, si existe. */
  async getSupervisor(empresaId: string): Promise<Supervisor | null> {
    return http<Supervisor | null>(`/api/v1/empresa/${empresaId}/supervisor`);
  },

  /** Registra los datos de la empresa/institución de prácticas (HU-13). */
  async register(payload: CreateEmpresaPayload, _user: User): Promise<Empresa> {
    return http<Empresa>("/api/v1/empresa", { method: "POST", body: payload });
  },

  /** Registra al supervisor externo asignado en la empresa (HU-19). */
  async registerSupervisor(
    empresaId: string,
    payload: CreateSupervisorPayload,
  ): Promise<Supervisor> {
    return http<Supervisor>(`/api/v1/empresa/${empresaId}/supervisor`, {
      method: "POST",
      body: payload,
    });
  },
};
