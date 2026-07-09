import type { ApiError } from "../types";

/**
 * Cliente HTTP real contra el backend FastAPI del SSP.
 * Adjunta el JWT guardado y normaliza los errores a la forma `ApiError`.
 */

export const BASE_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000"
).replace(/\/$/, "");

const TOKEN_KEY = "ssp.token";

interface HttpOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Adjuntar el token de sesión (por defecto sí). */
  auth?: boolean;
}

/** Realiza una petición JSON y devuelve el cuerpo tipado, o lanza `ApiError`. */
export async function http<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err: ApiError = {
      status: 0,
      message: "No se pudo conectar con el servidor.",
    };
    throw err;
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg;
      }
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
