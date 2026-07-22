import { createContext } from "react";
import type { LoginResponse, RegisterPayload, User } from "../types";

/** Valor expuesto por el contexto de autenticación. */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  /** Refresca el usuario en sesión tras editar el perfil (HU-46). */
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
