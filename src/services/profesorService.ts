import { http } from "./apiClient";
import type { PracticanteProgreso } from "../types";

export const profesorService = {
  /** GET /api/v1/profesor/practicantes — lista practicantes con progreso. */
  async listPracticantes(): Promise<PracticanteProgreso[]> {
    return http<PracticanteProgreso[]>("/api/v1/profesor/practicantes");
  },
};
