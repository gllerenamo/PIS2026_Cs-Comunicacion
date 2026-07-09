import type {
  CreateMetaPayload,
  Meta,
  RegistrarAvanceMetaPayload,
  User,
} from "../types";
import { http } from "./apiClient";

/**
 * Gestión de metas cuantitativas por practicante (HU-20): el asesor define
 * objetivos (artículos, notas periodísticas, notas de prensa, horas
 * trabajadas) y registra el avance real para medir el cumplimiento de cada
 * ciclo de prácticas. Contra el backend FastAPI; el rol y la identidad se
 * derivan del JWT.
 */
export const metaService = {
  /** Metas visibles para el usuario según su rol. */
  async list(_user: User): Promise<Meta[]> {
    return http<Meta[]>("/api/v1/metas");
  },

  /** Metas de un practicante específico (para la vista de gestión). */
  async listByPracticante(practicanteId: string): Promise<Meta[]> {
    return http<Meta[]>(`/api/v1/metas/practicante/${practicanteId}`);
  },

  /** Define una nueva meta para el ciclo de prácticas indicado. */
  async create(
    practicaId: string,
    payload: CreateMetaPayload,
    _asesor: User,
  ): Promise<Meta> {
    return http<Meta>(`/api/v1/metas/practica/${practicaId}`, {
      method: "POST",
      body: payload,
    });
  },

  /** Registra avance real (cantidad producida) sobre una meta existente. */
  async registrarAvance(
    metaId: string,
    payload: RegistrarAvanceMetaPayload,
    _asesor: User,
  ): Promise<Meta> {
    return http<Meta>(`/api/v1/metas/${metaId}/avance`, {
      method: "PUT",
      body: payload,
    });
  },
};
