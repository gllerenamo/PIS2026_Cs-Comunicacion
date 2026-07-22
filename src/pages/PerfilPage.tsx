import { useState } from "react";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import type { ApiError } from "../types";
import "./profesor/docencia.css";

const ROL_TXT: Record<string, string> = {
  ALUMNO: "Practicante",
  PROFESOR: "Docente / Jefe de prácticas",
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor del centro de prácticas",
};

function mensajeError(e: unknown, porDefecto: string): string {
  if (typeof e === "object" && e !== null && "message" in e) {
    return (e as ApiError).message || porDefecto;
  }
  return porDefecto;
}

/** HU-46 · Edición del perfil personal y cambio de contraseña. */
export function PerfilPage() {
  const { user, updateUser } = useAuth();

  const [nombres, setNombres] = useState(user?.nombres ?? "");
  const [apellidos, setApellidos] = useState(user?.apellidos ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [msgPerfil, setMsgPerfil] = useState("");
  const [errPerfil, setErrPerfil] = useState("");

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [msgPass, setMsgPass] = useState("");
  const [errPass, setErrPass] = useState("");

  if (!user) return null;

  async function guardarPerfil() {
    if (!nombres.trim() || !apellidos.trim() || !email.trim()) {
      setErrPerfil("Completa nombres, apellidos y correo.");
      return;
    }
    setGuardandoPerfil(true);
    setErrPerfil("");
    setMsgPerfil("");
    try {
      const actualizado = await authService.updatePerfil({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email.trim(),
      });
      updateUser(actualizado);
      setMsgPerfil("Datos personales actualizados.");
    } catch (e) {
      setErrPerfil(mensajeError(e, "No se pudieron guardar los datos."));
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function guardarPassword() {
    if (nueva !== repetir) {
      setErrPass("La nueva contraseña y su repetición no coinciden.");
      return;
    }
    if (nueva.length < 6) {
      setErrPass("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setGuardandoPass(true);
    setErrPass("");
    setMsgPass("");
    try {
      const r = await authService.cambiarPassword({
        passwordActual: actual,
        passwordNueva: nueva,
      });
      setMsgPass(r.message);
      setActual("");
      setNueva("");
      setRepetir("");
    } catch (e) {
      setErrPass(mensajeError(e, "No se pudo cambiar la contraseña."));
    } finally {
      setGuardandoPass(false);
    }
  }

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Cuenta › Mi perfil</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Mi perfil</h1>
          <p className="doc__subtitle">{ROL_TXT[user.role] ?? user.role}</p>
        </div>
      </header>

      <div className="doc-form">
        <div className="doc-card__title" style={{ marginBottom: 12 }}>
          Datos personales
        </div>
        <label className="doc-kpi__lbl">Nombres</label>
        <input className="doc-input" value={nombres} onChange={(e) => setNombres(e.target.value)} />
        <label className="doc-kpi__lbl">Apellidos</label>
        <input
          className="doc-input"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
        />
        <label className="doc-kpi__lbl">Correo</label>
        <input
          className="doc-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="doc-muted" style={{ fontSize: 11.5, marginBottom: 10 }}>
          Si cambias tu correo, deberás usarlo para iniciar sesión la próxima vez.
        </p>
        {errPerfil && <p className="doc-error">{errPerfil}</p>}
        <div className="doc-form__foot">
          {msgPerfil && <span className="doc-chip doc-chip--ok">{msgPerfil}</span>}
          <button className="doc-btn" onClick={guardarPerfil} disabled={guardandoPerfil}>
            {guardandoPerfil ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="doc-form">
        <div className="doc-card__title" style={{ marginBottom: 12 }}>
          Cambiar contraseña
        </div>
        <label className="doc-kpi__lbl">Contraseña actual</label>
        <input
          className="doc-input"
          type="password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
        <label className="doc-kpi__lbl">Nueva contraseña</label>
        <input
          className="doc-input"
          type="password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <label className="doc-kpi__lbl">Repetir nueva contraseña</label>
        <input
          className="doc-input"
          type="password"
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
        />
        {errPass && <p className="doc-error">{errPass}</p>}
        <div className="doc-form__foot">
          {msgPass && <span className="doc-chip doc-chip--ok">{msgPass}</span>}
          <button className="doc-btn" onClick={guardarPassword} disabled={guardandoPass}>
            {guardandoPass ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}
