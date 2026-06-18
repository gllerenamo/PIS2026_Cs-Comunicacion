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

          {/* Vista del alumno: clases programadas (HU-05) */}
          <Route element={<ProtectedRoute roles={["ALUMNO"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/mis-aulas" element={<MisAulasPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
