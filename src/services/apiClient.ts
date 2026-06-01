import type { ApiError } from "../types";

/**
 * Cliente API simulado.
 *
 * Mientras el backend (FastAPI) no esté disponible, esta capa imita la latencia
 * de red y la forma de las respuestas/errores HTTP descritos en el documento de
 * arquitectura. Cuando el backend exista, basta con reemplazar el cuerpo de los
 * servicios por llamadas `fetch` reales: los componentes no cambian.
 */

const BASE_LATENCY = 450;

/** Simula el tiempo de ida y vuelta de una petición de red. */
export function delay<T>(value: T, ms: number = BASE_LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Construye un error con la forma normalizada de la API. */
export function apiError(status: number, message: string): ApiError {
  return { status, message };
}

/** Rechaza una promesa tras la latencia simulada (para errores). */
export function rejectAfter(status: number, message: string): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(apiError(status, message)), BASE_LATENCY),
  );
}
