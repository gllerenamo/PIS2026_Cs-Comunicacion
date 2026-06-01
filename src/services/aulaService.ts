import type { Aula, CreateAulaPayload, User } from "../types";
import { delay, rejectAfter } from "./apiClient";
import { db, genId } from "./mockDb";

/**
 * Servicio de gestión de aulas / clases / prácticas (HU-4).
 * Equivale a los endpoints de gestión académica del API Gateway.
 */
export const aulaService = {
  /** Lista las aulas visibles para el usuario según su rol (RBAC). */
  async list(user: User): Promise<Aula[]> {
    const all = db.getAulas();
    if (user.role === "PROFESOR") {
      return delay(db.getAulasByProfesor(user.id));
    }
    // Admin ve todo; alumno vería solo las suyas (aquí, todas las activas).
    return delay(all);
  },

  /** Crea una nueva clase/práctica. Solo Admin y Profesor. */
  async create(payload: CreateAulaPayload, owner: User): Promise<Aula> {
    if (owner.role === "ALUMNO") {
      return rejectAfter(403, "No tienes permisos para crear clases.");
    }
    const codigo = payload.codigo.trim().toUpperCase();
    if (db.getAulas().some((a) => a.codigo === codigo)) {
      return rejectAfter(409, `Ya existe una clase con el código ${codigo}.`);
    }
    const aula: Aula = {
      id: genId("a"),
      nombre: payload.nombre.trim(),
      codigo,
      descripcion: payload.descripcion.trim(),
      periodo: payload.periodo.trim(),
      profesorId: owner.id,
      profesorNombre: `${owner.nombres} ${owner.apellidos}`,
      estado: "ACTIVA",
      inscritos: 0,
      createdAt: new Date().toISOString(),
    };
    db.addAula(aula);
    return delay(aula);
  },
};
