import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../types";
import { useAuth } from "../hooks/useAuth";

/**
 * Protege rutas que requieren sesión. Si se indican `roles`, además aplica
 * control de acceso por rol (RBAC). Redirige a /login si no hay sesión.
 */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
