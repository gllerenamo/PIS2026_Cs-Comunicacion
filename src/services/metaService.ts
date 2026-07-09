import type {
  CreateMetaPayload,
  Meta,
  MetaTipo,
  RegistrarAvanceMetaPayload,
  User,
} from "../types";
import { delay, rejectAfter } from "./apiClient";
import { db, genId } from "./mockDb";

/**
 * Metas cuyo avance no se registra a mano: se calculan a partir de otra
 * fuente de datos ya existente en el sistema.
 */
const TIPOS_AVANCE_AUTOMATICO: MetaTipo[] = ["HORAS"];

/**
 * Para metas de tipo HORAS, el avance real es siempre `horasAcumuladas` de
 * la práctica (la misma bitácora que el alumno registra en HU-14), en vez
 * de un contador propio que podría desincronizarse.
 */
function resolverAvance(meta: Meta): Meta {
  if (meta.tipo !== "HORAS") return meta;
  const practica = db.getPracticaById(meta.practicaId);
  if (!practica) return meta;
  return { ...meta, cantidadAlcanzada: practica.horasAcumuladas };
}

/**
 * Gestión de metas cuantitativas por practicante (HU-20): el asesor define
 * objetivos (artículos, notas periodísticas, notas de prensa, horas
 * trabajadas) y registra el avance real para medir el cumplimiento de cada
 * ciclo de prácticas.
 */
export const metaService = {
  /** Metas visibles para el usuario según su rol. */
  async list(user: User): Promise<Meta[]> {
    if (user.role === "ALUMNO") {
      return delay(db.getMetasByPracticante(user.id).map(resolverAvance));
    }
    if (user.role === "PROFESOR") {
      return delay(db.getMetasByDocente(user.id).map(resolverAvance));
    }
    if (user.role === "ADMIN") {
      return delay(db.getMetas().map(resolverAvance));
    }
    return delay([]);
  },

  /** Metas de un practicante específico (para la vista de gestión). */
  async listByPracticante(practicanteId: string): Promise<Meta[]> {
    return delay(db.getMetasByPracticante(practicanteId).map(resolverAvance));
  },

  /** Define una nueva meta para el ciclo de prácticas indicado. */
  async create(
    practicaId: string,
    payload: CreateMetaPayload,
    asesor: User,
  ): Promise<Meta> {
    if (asesor.role === "ALUMNO") {
      return rejectAfter(403, "Solo un asesor o administrador puede definir metas.");
    }
    const practica = db.getPracticaById(practicaId);
    if (!practica) return rejectAfter(404, "No se encontró la práctica del practicante.");
    if (payload.cantidadObjetivo <= 0) {
      return rejectAfter(400, "La cantidad objetivo debe ser mayor a 0.");
    }

    const meta: Meta = {
      id: genId("m"),
      practicaId,
      practicanteId: practica.practicanteId,
      practicanteNombre: practica.practicanteNombre,
      tipo: payload.tipo,
      cantidadObjetivo: payload.cantidadObjetivo,
      cantidadAlcanzada: 0,
      descripcion: payload.descripcion?.trim() || undefined,
      creadoPor: `${asesor.nombres} ${asesor.apellidos}`,
      fechaCreacion: new Date().toISOString(),
    };
    db.addMeta(meta);
    return delay(resolverAvance(meta));
  },

  /** Registra avance real (cantidad producida) sobre una meta existente. */
  async registrarAvance(
    metaId: string,
    payload: RegistrarAvanceMetaPayload,
    asesor: User,
  ): Promise<Meta> {
    if (asesor.role === "ALUMNO") {
      return rejectAfter(403, "Solo un asesor o administrador puede registrar el avance.");
    }
    const meta = db.getMetaById(metaId);
    if (!meta) return rejectAfter(404, "No se encontró la meta.");
    if (TIPOS_AVANCE_AUTOMATICO.includes(meta.tipo)) {
      return rejectAfter(
        409,
        "El avance de horas trabajadas se calcula automáticamente desde la bitácora de horas.",
      );
    }
    if (payload.cantidad <= 0) {
      return rejectAfter(400, "La cantidad debe ser mayor a 0.");
    }

    const actualizada: Meta = {
      ...meta,
      cantidadAlcanzada: meta.cantidadAlcanzada + payload.cantidad,
    };
    db.updateMeta(actualizada);
    return delay(actualizada);
  },
};
