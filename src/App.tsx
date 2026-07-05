import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AulasPage } from "./pages/aulas/AulasPage";
import { MisAulasPage } from "./pages/alumno/MisAulasPage";
import { AulaVirtualPage } from "./pages/alumno/AulaVirtualPage";
import { ProgresoPage } from "./pages/profesor/ProgresoPage";
import { UsuariosPage } from "./pages/admin/UsuariosPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar" element={<ForgotPasswordPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* Rutas protegidas (requieren sesión) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Route>

          {/* Gestión de clases: solo Admin y Profesor (RBAC) */}
          <Route element={<ProtectedRoute roles={["ADMIN", "PROFESOR"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/aulas" element={<AulasPage />} />
            </Route>
          </Route>

          {/* Vista del alumno: clases programadas (HU-05) y aula virtual (HU-06) */}
          <Route element={<ProtectedRoute roles={["ALUMNO"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/mis-aulas" element={<MisAulasPage />} />
              <Route path="/mis-aulas/:id" element={<AulaVirtualPage />} />
            </Route>
          </Route>

          {/* Progreso practicantes (HU-11): Profesor y Admin */}
          <Route element={<ProtectedRoute roles={["ADMIN", "PROFESOR"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/progreso" element={<ProgresoPage />} />
            </Route>
          </Route>

          {/* Gestión de usuarios (HU-12): solo Admin */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
