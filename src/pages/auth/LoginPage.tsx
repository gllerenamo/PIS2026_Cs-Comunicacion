import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { Alert } from "../../components/ui/Alert";
import { useAuth } from "../../hooks/useAuth";
import { isEmail, isRequired, errorMessage } from "../../utils/validators";
import "./auth-form.css";

/** HU-1 · Iniciar sesión. */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Ingresa un correo válido.";
    if (!isRequired(password)) next.password = "Ingresa tu contraseña.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setApiError(errorMessage(err, "No se pudo iniciar sesión."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede con tu cuenta institucional para continuar."
      footer={
        <>
          ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {apiError && <Alert tone="error">{apiError}</Alert>}

        <TextField
          label="Correo institucional"
          type="email"
          placeholder="usuario@unsa.edu.pe"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <TextField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="auth-form__row">
          <Link to="/recuperar" className="auth-form__link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Ingresar
        </Button>
      </form>

      <p className="auth-form__demo">
        <strong>Cuentas de prueba:</strong> admin@unsa.edu.pe / admin123 ·
        profesor@unsa.edu.pe / profesor123 · alumno@unsa.edu.pe / alumno123
      </p>
    </AuthLayout>
  );
}
