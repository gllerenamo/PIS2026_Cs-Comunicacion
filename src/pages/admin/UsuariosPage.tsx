import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { Role, UsuarioAdmin } from "../../types";
import "./UsuariosPage.css";

// SUPERVISOR no es asignable desde aquí: se aprovisiona junto con el
// registro de un Supervisor externo (HU-19/24), no por cambio de rol libre.
const ROLES: Role[] = ["ADMIN", "PROFESOR", "ALUMNO"];
const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
  ALUMNO: "Alumno",
  SUPERVISOR: "Supervisor",
};

type Filtro = "TODOS" | Role;

/** HU-12 · Gestión de usuarios (rol Admin). */
export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    adminService
      .listUsuarios()
      .then(setUsuarios)
      .catch(() => setError("No se pudo cargar la lista de usuarios."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRolChange(usuario: UsuarioAdmin, nuevoRol: Role) {
    if (nuevoRol === usuario.role) return;
    setSaving(usuario.id);
    try {
      const actualizado = await adminService.updateRol(usuario.id, nuevoRol);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === actualizado.id ? actualizado : u))
      );
      setFeedback((prev) => ({ ...prev, [usuario.id]: "Rol actualizado." }));
      setTimeout(
        () => setFeedback((prev) => ({ ...prev, [usuario.id]: "" })),
        2500
      );
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [usuario.id]: err instanceof Error ? err.message : "Error al cambiar el rol.",
      }));
    } finally {
      setSaving(null);
    }
  }

  const filtrados =
    filtro === "TODOS" ? usuarios : usuarios.filter((u) => u.role === filtro);

  return (
    <div className="usuarios-page">
      <p className="usuarios-page__breadcrumb">Inicio › Gestión de usuarios</p>
      <header className="usuarios-page__head">
        <h1 className="usuarios-page__title">Gestión de usuarios</h1>
        <p className="usuarios-page__subtitle">{usuarios.length} usuarios registrados</p>
      </header>

      {/* Filtros por rol */}
      <div className="usuarios-filtros">
        {(["TODOS", ...ROLES] as (Filtro)[]).map((f) => (
          <button
            key={f}
            className={`usuarios-filtro-btn ${filtro === f ? "is-active" : ""}`}
            onClick={() => setFiltro(f)}
          >
            {f === "TODOS" ? "Todos" : ROLE_LABEL[f as Role]}
          </button>
        ))}
      </div>

      {error && <p className="usuarios-page__error">{error}</p>}

      {loading ? (
        <p className="usuarios-page__muted">Cargando usuarios…</p>
      ) : (
        <div className="usuarios-table-wrap">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id}>
                  <td className="usuarios-table__nombre">
                    {u.nombres} {u.apellidos}
                  </td>
                  <td className="usuarios-table__email">{u.email}</td>
                  <td className="usuarios-table__rol">
                    <select
                      className="usuarios-rol-select"
                      value={u.role}
                      disabled={saving === u.id}
                      onChange={(e) =>
                        handleRolChange(u, e.target.value as Role)
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="usuarios-table__estado">
                    {saving === u.id ? (
                      <span className="usuarios-feedback usuarios-feedback--saving">
                        Guardando…
                      </span>
                    ) : feedback[u.id] ? (
                      <span
                        className={`usuarios-feedback ${
                          feedback[u.id].includes("Error") ||
                          feedback[u.id].includes("error")
                            ? "usuarios-feedback--error"
                            : "usuarios-feedback--ok"
                        }`}
                      >
                        {feedback[u.id]}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="usuarios-table__empty">
                    No hay usuarios con este rol.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
