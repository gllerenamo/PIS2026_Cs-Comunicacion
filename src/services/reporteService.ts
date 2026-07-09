import type { ReporteFinal, User } from "../types";
import { delay, rejectAfter } from "./apiClient";
import { db, genId } from "./mockDb";

/**
 * Servicio de generación del reporte final consolidado de prácticas (HU-16),
 * evidencia formal ante la Escuela de Ciencias de la Comunicación.
 */
export const reporteService = {
  /** Genera el reporte final consolidando práctica, empresa, supervisor y horas. */
  async generar(practicaId: string, user: User): Promise<ReporteFinal> {
    const practica = db.getPracticaById(practicaId);
    if (!practica) return rejectAfter(404, "No se encontró la práctica.");

    const empresa = practica.empresaId
      ? db.getEmpresas().find((e) => e.id === practica.empresaId)
      : undefined;
    const supervisor = empresa ? db.getSupervisorByEmpresa(empresa.id) : undefined;
    const horas = db.getHorasByPractica(practicaId);

    const lineas = [
      `REPORTE FINAL DE PRÁCTICAS PRE-PROFESIONALES`,
      `Escuela Profesional de Ciencias de la Comunicación — UNSA`,
      ``,
      `Practicante: ${practica.practicanteNombre}`,
      `Aula / práctica: ${practica.aulaNombre} (${practica.periodo})`,
      `Estado: ${practica.estado === "CERRADA" ? "Cerrada y validada" : "En curso"}`,
      `Horas acumuladas: ${practica.horasAcumuladas} / ${practica.horasMinimas} (mín. reglamentario RCU 0501-2020)`,
      ``,
      `Empresa / centro de prácticas: ${empresa ? empresa.razonSocial : "No registrada"}`,
      empresa ? `RUC: ${empresa.ruc} — ${empresa.direccion}` : "",
      supervisor
        ? `Supervisor externo: ${supervisor.nombres} ${supervisor.apellidos} (${supervisor.cargo}) — ${supervisor.email}`
        : "Supervisor externo: No registrado",
      ``,
      `Bitácora de horas (${horas.length} registro(s)):`,
      ...horas.map(
        (h) =>
          `  • ${new Date(h.fecha).toLocaleDateString("es-PE")} — ${h.horas}h — ${h.descripcion}`,
      ),
      ``,
      practica.validadoPor
        ? `Validado por: ${practica.validadoPor} el ${new Date(practica.fechaCierre ?? "").toLocaleDateString("es-PE")}`
        : "Pendiente de validación docente.",
      ``,
      `Generado por: ${user.nombres} ${user.apellidos} el ${new Date().toLocaleDateString("es-PE")}`,
    ].filter((l) => l !== "");

    const reporte: ReporteFinal = {
      id: genId("r"),
      practicaId,
      generadoPor: `${user.nombres} ${user.apellidos}`,
      generadoEn: new Date().toISOString(),
      contenido: lineas.join("\n"),
    };
    return delay(reporte, 700);
  },
};
