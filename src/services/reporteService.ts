import type { ReporteFinal, User } from "../types";
import { http } from "./apiClient";

/**
 * Servicio de generación del reporte final consolidado de prácticas (HU-16),
 * evidencia formal ante la Escuela de Ciencias de la Comunicación.
 * El backend consolida práctica, empresa, supervisor y bitácora de horas.
 */
export const reporteService = {
  /** Genera el reporte final de una práctica. */
  async generar(practicaId: string, _user: User): Promise<ReporteFinal> {
    return http<ReporteFinal>(`/api/v1/practicas/${practicaId}/reporte`, {
      method: "POST",
    });
  },
};
