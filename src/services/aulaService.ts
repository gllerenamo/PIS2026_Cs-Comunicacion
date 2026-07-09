import type { Aula, CreateAulaPayload, User } from "../types";
import { http } from "./apiClient";

/**
 * Servicio de gestión de aulas / clases / prácticas (HU-4).
 * Consume /api/v1/aulas. El backend aplica el RBAC según el JWT, por lo que el
 * `User` recibido solo se usa para claridad en los componentes.
 */
export const aulaService = {
  /** GET /api/v1/aulas — el backend filtra por rol. */
  async list(user: User): Promise<Aula[]> {
    void user;
    return http<Aula[]>("/api/v1/aulas");
  },

  /** POST /api/v1/aulas — crea una clase (Admin/Profesor). 409 si código duplicado. */
  async create(payload: CreateAulaPayload, owner: User): Promise<Aula> {
    void owner;
    return http<Aula>("/api/v1/aulas", { method: "POST", body: payload });
  },
};
