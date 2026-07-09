import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AulasPage } from "./pages/aulas/AulasPage";
import { EmpresaPage } from "./pages/empresa/EmpresaPage";
import { HorasPage } from "./pages/horas/HorasPage";
import { CierrePage } from "./pages/cierre/CierrePage";
import { ReportePage } from "./pages/reporte/ReportePage";
import { HistorialPage } from "./pages/historial/HistorialPage";

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
              {/* HU-16: reporte final, visible para alumno y docente/admin */}
              <Route path="/reporte" element={<ReportePage />} />
            </Route>
          </Route>

          {/* Gestión de clases: solo Admin y Profesor (RBAC) */}
          <Route element={<ProtectedRoute roles={["ADMIN", "PROFESOR"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/aulas" element={<AulasPage />} />
              {/* HU-15: cierre y validación de prácticas */}
              <Route path="/cierre" element={<CierrePage />} />
              {/* HU-18: historial de prácticas por practicante */}
              <Route path="/historial" element={<HistorialPage />} />
            </Route>
          </Route>

          {/* Gestión propia del practicante: solo Alumno (RBAC) */}
          <Route element={<ProtectedRoute roles={["ALUMNO"]} />}>
            <Route element={<AppLayout />}>
              {/* HU-13 + HU-19: empresa y supervisor externo */}
              <Route path="/empresa" element={<EmpresaPage />} />
              {/* HU-14: seguimiento de horas acumuladas */}
              <Route path="/horas" element={<HorasPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
