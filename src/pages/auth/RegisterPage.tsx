import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { SelectField } from "../../components/ui/SelectField";
import { Alert } from "../../components/ui/Alert";
import { authService } from "../../services/authService";
import type { Role } from "../../types";
import {
  isEmail,
  isRequired,
  passwordIssue,
  errorMessage,
} from "../../utils/validators";
import "./auth-form.css";

interface FormState {
  nombres: string;
  apellidos: string;
  email: string;
  codigo: string;
  role: Role;
  password: string;
  confirm: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = {
  nombres: "",
  apellidos: "",
  email: "",
  codigo: "",
  role: "ALUMNO",
  password: "",
  confirm: "",
};

/** HU-3 · Registrar nuevas cuentas. */
export function RegisterPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!isRequired(form.nombres)) next.nombres = "Requerido.";
    if (!isRequired(form.apellidos)) next.apellidos = "Requerido.";
    if (!isEmail(form.email)) next.email = "Correo no válido.";
    if (form.role === "ALUMNO" && !isRequired(form.codigo)) {
      next.codigo = "El CUI es obligatorio para alumnos.";
    }
    const pwIssue = passwordIssue(form.password);
    if (pwIssue) next.password = pwIssue;
    if (form.confirm !== form.password) {
      next.confirm = "Las contraseñas no coinciden.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.register({
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        password: form.password,
        role: form.role,
        codigo: form.codigo || undefined,
      });
      setDone(true);
    } catch (err) {
      setApiError(errorMessage(err, "No se pudo crear la cuenta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Regístrate para acceder al sistema de prácticas."
      footer={
        <>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      {done ? (
        <div className="auth-form">
          <Alert tone="success">
            ¡Cuenta creada correctamente! Ya puedes iniciar sesión.
          </Alert>
          <Link to="/login">
            <Button fullWidth>Ir a iniciar sesión</Button>
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {apiError && <Alert tone="error">{apiError}</Alert>}

          <div className="auth-form__grid">
            <TextField
              label="Nombres"
              value={form.nombres}
              onChange={(e) => update("nombres", e.target.value)}
              error={errors.nombres}
            />
            <TextField
              label="Apellidos"
              value={form.apellidos}
              onChange={(e) => update("apellidos", e.target.value)}
              error={errors.apellidos}
            />
          </div>

          <TextField
            label="Correo institucional"
            type="email"
            placeholder="usuario@unsa.edu.pe"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
          />

          <div className="auth-form__grid">
            <SelectField
              label="Tipo de cuenta"
              value={form.role}
              onChange={(e) => update("role", e.target.value as Role)}
              options={[
                { value: "ALUMNO", label: "Alumno / Practicante" },
                { value: "PROFESOR", label: "Profesor" },
                { value: "ADMIN", label: "Administrador" },
              ]}
            />
            <TextField
              label="Código (CUI)"
              value={form.codigo}
              onChange={(e) => update("codigo", e.target.value)}
              error={errors.codigo}
              hint={form.role === "ALUMNO" ? undefined : "Opcional"}
            />
          </div>

          <TextField
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
            hint="Mínimo 8 caracteres, con letras y números."
          />

          <TextField
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
            error={errors.confirm}
          />

          <Button type="submit" fullWidth loading={loading}>
            Crear cuenta
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
