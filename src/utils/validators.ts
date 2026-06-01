/** Utilidades de validación de formularios. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/** Devuelve un mensaje si la contraseña es débil, o null si es válida. */
export function passwordIssue(value: string): string | null {
  if (value.length < 8) return "Debe tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return "Debe combinar letras y números.";
  }
  return null;
}

/** Extrae el mensaje legible de un error de la capa de servicios. */
export function errorMessage(err: unknown, fallback = "Ocurrió un error."): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}
