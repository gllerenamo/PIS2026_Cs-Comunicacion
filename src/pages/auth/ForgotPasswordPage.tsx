import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { Alert } from "../../components/ui/Alert";
import { authService } from "../../services/authService";
import { isEmail, errorMessage } from "../../utils/validators";
import "./auth-form.css";

/** HU-2 · Recuperar contraseña. */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!isEmail(email)) {
      setError("Ingresa un correo válido.");
      return;
    }
    setError(undefined);

    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setSent(res.message);
    } catch (err) {
      setApiError(errorMessage(err, "No se pudo procesar la solicitud."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu acceso."
      footer={
        <>
          ¿Recordaste tu contraseña? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      {sent ? (
        <div className="auth-form">
          <Alert tone="success">{sent}</Alert>
          <p className="auth-form__note">
            Revisa tu bandeja de entrada y la carpeta de spam. El enlace expira
            en 30 minutos.
          </p>
          <Link to="/login">
            <Button variant="secondary" fullWidth>
              Volver a iniciar sesión
            </Button>
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {apiError && <Alert tone="error">{apiError}</Alert>}
          <TextField
            label="Correo institucional"
            type="email"
            placeholder="usuario@unsa.edu.pe"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            hint="Usa el correo con el que te registraste."
          />
          <Button type="submit" fullWidth loading={loading}>
            Enviar enlace de recuperación
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
