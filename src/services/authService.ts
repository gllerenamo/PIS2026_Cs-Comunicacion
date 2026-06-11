import type { LoginResponse, RegisterPayload, User } from "../types";
import { delay, rejectAfter } from "./apiClient";
import { db, genId } from "./mockDb";

/**
 * Servicio de autenticación e identidad (Módulo IAM).
 * Replica los endpoints /api/v1/auth/* del documento de arquitectura.
 */

const TOKEN_KEY = "ssp.token";
const SESSION_KEY = "ssp.session";

/** Genera un "JWT" simulado (no es criptográficamente válido). */
function fakeJwt(user: User): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ sub: user.id, role: user.role, email: user.email }),
  );
  return `${header}.${payload}.mock-signature`;
}

export const authService = {
  /** POST /api/v1/auth/login → 200 (token + user) | 401 | 403 */
  async login(email: string, password: string): Promise<LoginResponse> {
    const emailLower = email.toLowerCase();
    const ATTEMPTS_KEY = "ssp.login_attempts";

    // Recuperar registro de intentos fallidos
    const attemptsData = localStorage.getItem(ATTEMPTS_KEY);
    let attempts: Record<string, { count: number; lockedUntil?: number }> = {};
    if (attemptsData) {
      try {
        attempts = JSON.parse(attemptsData);
      } catch (e) {
        attempts = {};
      }
    }

    const record = attempts[emailLower] || { count: 0 };

    // Verificar si el acceso está bloqueado
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      const remainingMs = record.lockedUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return rejectAfter(
        403,
        `Acceso bloqueado. Intente nuevamente en ${remainingMinutes} minutos.`
      );
    }

    const user = db.findUserByEmail(email);
    if (!user || user.password !== password) {
      // Incrementar contador de intentos fallidos
      record.count = (record.count || 0) + 1;

      // Si supera 5 intentos fallidos, se bloquea el acceso por 15 minutos
      // El 5º intento fallido establece el bloqueo, y a partir del siguiente intento (cuando intenta nuevamente)
      // se le niega el acceso.
      if (record.count >= 5) {
        record.lockedUntil = Date.now() + 15 * 60 * 1000;
      }

      attempts[emailLower] = record;
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      return rejectAfter(401, "Correo o contraseña incorrectos.");
    }

    // Login exitoso: limpiar historial de intentos para este correo
    delete attempts[emailLower];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

    const { password: _omit, ...publicUser } = user;
    void _omit;
    const token = fakeJwt(publicUser);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    return delay({ token, user: publicUser });
  },

  /** POST /api/v1/auth/register → 201 | 409 (correo ya registrado) */
  async register(payload: RegisterPayload): Promise<User> {
    if (db.findUserByEmail(payload.email)) {
      return rejectAfter(409, "Ya existe una cuenta con este correo.");
    }
    const user: User = {
      id: genId("u"),
      nombres: payload.nombres.trim(),
      apellidos: payload.apellidos.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
    };
    db.addUser({ ...user, password: payload.password });
    return delay(user);
  },

  /** POST /api/v1/auth/recover → 200 (siempre, para no filtrar correos válidos) */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Por seguridad la respuesta es uniforme exista o no la cuenta.
    void email; // (en el backend real se usaría para enviar el correo)
    return delay({
      message:
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
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
