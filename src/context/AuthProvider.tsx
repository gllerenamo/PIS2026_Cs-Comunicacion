import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LoginResponse, RegisterPayload, User } from "../types";
import { authService } from "../services/authService";
import { AuthContext } from "./auth-context";

/**
 * Proveedor del estado de autenticación. Mantiene el usuario en sesión y
 * expone las operaciones de login/registro/logout al árbol de componentes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    authService.getCurrentUser(),
  );

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const res = await authService.login(email, password);
      setUser(res.user);
      return res;
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      return authService.register(payload);
    },
    [],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
