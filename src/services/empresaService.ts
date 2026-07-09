import type {
  CreateEmpresaPayload,
  CreateSupervisorPayload,
  Empresa,
  Supervisor,
  User,
} from "../types";
import { delay, rejectAfter } from "./apiClient";
import { db, genId } from "./mockDb";

/**
 * Servicio de registro de empresa/centro de prácticas (HU-13) y de su
 * supervisor externo (HU-19). Solo el propio practicante gestiona sus datos.
 */
export const empresaService = {
  /** Empresa registrada por el practicante autenticado, si existe. */
  async getMine(user: User): Promise<Empresa | null> {
    return delay(db.getEmpresaByPracticante(user.id) ?? null);
  },

  /** Supervisor registrado para una empresa, si existe. */
  async getSupervisor(empresaId: string): Promise<Supervisor | null> {
    return delay(db.getSupervisorByEmpresa(empresaId) ?? null);
  },

  /** Registra los datos de la empresa/institución de prácticas (HU-13). */
  async register(payload: CreateEmpresaPayload, user: User): Promise<Empresa> {
    if (user.role !== "ALUMNO") {
      return rejectAfter(403, "Solo el practicante puede registrar su empresa.");
    }
    if (db.getEmpresaByPracticante(user.id)) {
      return rejectAfter(409, "Ya registraste una empresa para tus prácticas.");
    }
    const empresa: Empresa = {
      id: genId("e"),
      practicanteId: user.id,
      razonSocial: payload.razonSocial.trim(),
      ruc: payload.ruc.trim(),
      direccion: payload.direccion.trim(),
      sector: payload.sector.trim(),
      telefono: payload.telefono.trim(),
      email: payload.email.trim(),
      fechaRegistro: new Date().toISOString(),
    };
    db.addEmpresa(empresa);
    return delay(empresa);
  },

  /** Registra al supervisor externo asignado en la empresa (HU-19). */
  async registerSupervisor(
    empresaId: string,
    payload: CreateSupervisorPayload,
  ): Promise<Supervisor> {
    if (db.getSupervisorByEmpresa(empresaId)) {
      return rejectAfter(409, "Ya existe un supervisor registrado para esta empresa.");
    }
    const supervisor: Supervisor = {
      id: genId("s"),
      empresaId,
      nombres: payload.nombres.trim(),
      apellidos: payload.apellidos.trim(),
      cargo: payload.cargo.trim(),
      email: payload.email.trim(),
      telefono: payload.telefono.trim(),
    };
    db.addSupervisor(supervisor);
    return delay(supervisor);
  },
};
