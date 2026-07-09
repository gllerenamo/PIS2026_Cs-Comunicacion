import type { LoginResponse, RegisterPayload, User } from "../types";
import { http } from "./apiClient";

/**
 * Servicio de autenticación e identidad (Módulo IAM).
 * Consume los endpoints /api/v1/auth/* del backend FastAPI.
 */

const TOKEN_KEY = "ssp.token";
const SESSION_KEY = "ssp.session";

export const authService = {
  /** POST /api/v1/auth/login → 200 (token + user) | 401 */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await http<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
    return res;
  },

  /** POST /api/v1/auth/register → 201 | 409 */
  async register(payload: RegisterPayload): Promise<User> {
    return http<User>("/api/v1/auth/register", {
      method: "POST",
      auth: false,
      body: payload,
    });
  },

  /** POST /api/v1/auth/recover → 200 (respuesta uniforme) */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return http<{ message: string }>("/api/v1/auth/recover", {
      method: "POST",
      auth: false,
      body: { email },
    });
  },

  /** Cierra la sesión local. */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  /** Recupera la sesión persistida (para mantener login tras recargar). */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};
