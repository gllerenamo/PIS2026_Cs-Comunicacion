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
import { BitacoraPage } from "./pages/alumno/BitacoraPage";
import { ProgresoPage } from "./pages/profesor/ProgresoPage";
import { AsistenciaPage } from "./pages/profesor/AsistenciaPage";
import { RevisarPage } from "./pages/profesor/RevisarPage";
import { LibroPage } from "./pages/profesor/LibroPage";
import { SeguimientoPage } from "./pages/profesor/SeguimientoPage";
import { UsuariosPage } from "./pages/admin/UsuariosPage";
import { AulasAdminPage } from "./pages/admin/AulasAdminPage";
import { MatriculasPage } from "./pages/admin/MatriculasPage";
import { ReportesPage } from "./pages/admin/ReportesPage";
import { AuditoriaPage } from "./pages/admin/AuditoriaPage";
import { RolesPage } from "./pages/admin/RolesPage";
import { EmpresaPage } from "./pages/empresa/EmpresaPage";
import { HorasPage } from "./pages/horas/HorasPage";
import { CierrePage } from "./pages/cierre/CierrePage";
import { ReportePage } from "./pages/reporte/ReportePage";
import { HistorialPage } from "./pages/historial/HistorialPage";
import { MetasPage } from "./pages/metas/MetasPage";

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
              {/* HU-22/23/24: el panel se adapta al rol (profesor/admin/supervisor/alumno) */}
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Route>

          {/* Compartidas entre alumno, profesor y admin — el supervisor externo no accede aquí */}
          <Route element={<ProtectedRoute roles={["ADMIN", "PROFESOR", "ALUMNO"]} />}>
            <Route element={<AppLayout />}>
              {/* HU-16: reporte final */}
              <Route path="/reporte" element={<ReportePage />} />
              {/* HU-20: metas por practicante */}
              <Route path="/metas" element={<MetasPage />} />
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
              {/* HU-25: registro de asistencia */}
              <Route path="/asistencia" element={<AsistenciaPage />} />
              {/* HU-26: revisar y calificar entregas */}
              <Route path="/revisar" element={<RevisarPage />} />
              {/* HU-27: libro de calificaciones */}
              <Route path="/libro" element={<LibroPage />} />
              {/* HU-28: seguimiento individual del practicante */}
              <Route path="/seguimiento" element={<SeguimientoPage />} />
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

          {/* Vista del alumno: clases programadas (HU-05) y aula virtual (HU-06) */}
          <Route element={<ProtectedRoute roles={["ALUMNO"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/mis-aulas" element={<MisAulasPage />} />
              <Route path="/mis-aulas/:id" element={<AulaVirtualPage />} />
              <Route path="/bitacora" element={<BitacoraPage />} />
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
              {/* HU-29/30: gestión de aulas y asignación de profesores */}
              <Route path="/gestion-aulas" element={<AulasAdminPage />} />
              {/* HU-31: matrículas */}
              <Route path="/matriculas" element={<MatriculasPage />} />
              {/* HU-32: reportes institucionales */}
              <Route path="/reportes" element={<ReportesPage />} />
              {/* HU-33: auditoría */}
              <Route path="/auditoria" element={<AuditoriaPage />} />
              {/* HU-34: roles y permisos */}
              <Route path="/roles" element={<RolesPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
