import "../profesor/docencia.css";
import type { Role } from "../../types";

/** Módulos del sistema y qué rol accede a cada uno (refleja el RBAC real). */
const ROLES: { key: Role; label: string }[] = [
  { key: "ALUMNO", label: "Alumno" },
  { key: "PROFESOR", label: "Profesor" },
  { key: "SUPERVISOR", label: "Supervisor" },
  { key: "ADMIN", label: "Administrador" },
];

interface Modulo {
  nombre: string;
  acceso: Role[];
}

const MODULOS: Modulo[] = [
  { nombre: "Mis aulas / bitácora", acceso: ["ALUMNO"] },
  { nombre: "Mi empresa y supervisor", acceso: ["ALUMNO"] },
  { nombre: "Registro de horas", acceso: ["ALUMNO"] },
  { nombre: "Asistencia", acceso: ["PROFESOR", "ADMIN"] },
  { nombre: "Revisar y calificar entregas", acceso: ["PROFESOR", "ADMIN"] },
  { nombre: "Libro de calificaciones", acceso: ["PROFESOR", "ADMIN"] },
  { nombre: "Seguimiento de practicantes", acceso: ["PROFESOR", "ADMIN"] },
  { nombre: "Cierre y validación de prácticas", acceso: ["PROFESOR", "ADMIN"] },
  { nombre: "Validación de horas (empresa)", acceso: ["SUPERVISOR"] },
  { nombre: "Evaluación de desempeño (empresa)", acceso: ["SUPERVISOR"] },
  { nombre: "Gestión de usuarios", acceso: ["ADMIN"] },
  { nombre: "Gestión de aulas y matrículas", acceso: ["ADMIN"] },
  { nombre: "Asignar profesores", acceso: ["ADMIN"] },
  { nombre: "Reportes institucionales", acceso: ["ADMIN"] },
  { nombre: "Auditoría", acceso: ["ADMIN"] },
];

/** HU-34 · Matriz de roles y permisos (RBAC del sistema). */
export function RolesPage() {
  return (
    <div className="doc">
      <p className="doc__breadcrumb">Panel › Sistema › Roles y permisos</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Roles y permisos</h1>
          <p className="doc__subtitle">
            Control de acceso por rol (RBAC). Los permisos se aplican en el backend vía JWT.
          </p>
        </div>
      </header>

      <div className="doc-tablewrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Módulo</th>
              {ROLES.map((r) => (
                <th key={r.key} className="doc-table__num">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULOS.map((m) => (
              <tr key={m.nombre}>
                <td>{m.nombre}</td>
                {ROLES.map((r) => (
                  <td key={r.key} className="doc-table__num">
                    {m.acceso.includes(r.key) ? (
                      <span className="doc-chip doc-chip--ok">✓</span>
                    ) : (
                      <span style={{ color: "var(--color-text-soft)" }}>—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
