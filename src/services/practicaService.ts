import type {
  Practica,
  RegistrarHorasPayload,
  RegistroHoras,
  User,
} from "../types";
// User ya se usa en list()/getActual()/cerrar(); se reutiliza en listPracticantes().
import { delay, rejectAfter } from "./apiClient";
import { db, genId } from "./mockDb";

/**
 * Servicio central del ciclo de prácticas: acumulación de horas (HU-14),
 * cierre y validación docente (HU-15) e historial por practicante (HU-18).
 */
export const practicaService = {
  /** Prácticas visibles para el usuario según su rol. */
  async list(user: User): Promise<Practica[]> {
    if (user.role === "ALUMNO") {
      return delay(db.getPracticasByPracticante(user.id));
    }
    if (user.role === "PROFESOR") {
      return delay(db.getPracticasByDocente(user.id));
    }
    if (user.role === "ADMIN") {
      return delay(db.getPracticas());
    }
    return delay([]);
  },

  /** Práctica activa (o más reciente) del practicante autenticado. */
  async getActual(user: User): Promise<Practica | null> {
    const mias = db.getPracticasByPracticante(user.id);
    const activa = mias.find((p) => p.estado !== "CERRADA");
    return delay(activa ?? mias[0] ?? null);
  },

  /** Bitácora de horas registradas para una práctica (HU-14). */
  async getHoras(practicaId: string): Promise<RegistroHoras[]> {
    return delay(db.getHorasByPractica(practicaId));
  },

  /** Registra una nueva entrada de horas trabajadas (HU-14). */
  async registrarHoras(
    practicaId: string,
    payload: RegistrarHorasPayload,
  ): Promise<{ practica: Practica; registro: RegistroHoras }> {
    const practica = db.getPracticaById(practicaId);
    if (!practica) return rejectAfter(404, "No se encontró la práctica.");
    if (practica.estado === "CERRADA") {
      return rejectAfter(409, "Esta práctica ya fue cerrada y no admite más horas.");
    }
    if (payload.horas <= 0) {
      return rejectAfter(400, "Las horas deben ser un valor mayor a 0.");
    }

    const registro: RegistroHoras = {
      id: genId("h"),
      practicaId,
      fecha: payload.fecha ?? new Date().toISOString(),
      horas: payload.horas,
      descripcion: payload.descripcion.trim(),
      estadoValidacion: "PENDIENTE",
    };
    db.addRegistroHoras(registro);

    const horasAcumuladas = practica.horasAcumuladas + payload.horas;
    const actualizada: Practica = {
      ...practica,
      horasAcumuladas,
      estado:
        practica.estado === "EN_CURSO" && horasAcumuladas >= practica.horasMinimas
          ? "LISTA_PARA_CIERRE"
          : practica.estado,
    };
    db.updatePractica(actualizada);

    return delay({ practica: actualizada, registro });
  },

  /**
   * Cierra y valida formalmente una práctica (HU-15). Solo un docente/admin
   * puede validarla, y únicamente si se cumplen los requisitos reglamentarios
   * (horas mínimas cubiertas y empresa registrada).
   */
  async cerrar(practicaId: string, docente: User): Promise<Practica> {
    if (docente.role === "ALUMNO") {
      return rejectAfter(403, "Solo un docente o administrador puede validar el cierre.");
    }
    const practica = db.getPracticaById(practicaId);
    if (!practica) return rejectAfter(404, "No se encontró la práctica.");
    if (practica.estado === "CERRADA") {
      return rejectAfter(409, "Esta práctica ya se encuentra cerrada.");
    }
    if (practica.horasAcumuladas < practica.horasMinimas) {
      return rejectAfter(
        422,
        `Aún no cumple el mínimo de horas (${practica.horasAcumuladas}/${practica.horasMinimas}).`,
      );
    }
    if (!practica.empresaId) {
      return rejectAfter(422, "El practicante no ha registrado su empresa de prácticas.");
    }

    const cerrada: Practica = {
      ...practica,
      estado: "CERRADA",
      fechaCierre: new Date().toISOString(),
      validadoPor: `${docente.nombres} ${docente.apellidos}`,
    };
    db.updatePractica(cerrada);
    return delay(cerrada);
  },

  /** Historial completo de ciclos de prácticas de un practicante (HU-18). */
  async historial(practicanteId: string): Promise<Practica[]> {
    const registros = db
      .getPracticasByPracticante(practicanteId)
      .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
    return delay(registros);
  },

  /** Lista de practicantes (alumnos) con al menos un ciclo registrado (HU-18). */
  async listPracticantes(): Promise<User[]> {
    const ids = new Set(db.getPracticas().map((p) => p.practicanteId));
    const alumnos = db.getUsers().filter((u) => ids.has(u.id));
    return delay(alumnos);
  },
};
