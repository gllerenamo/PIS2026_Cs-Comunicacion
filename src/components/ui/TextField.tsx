import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./TextField.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

/** Campo de formulario con etiqueta, ayuda, error y toggle de contraseña. */
export function TextField({
  label,
  error,
  hint,
  icon,
  type = "text",
  id,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const isPassword = type === "password";
  const [reveal, setReveal] = useState(false);
  const inputType = isPassword && reveal ? "text" : type;

  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="field__control">
        {icon && <span className="field__icon">{icon}</span>}
        <input
          id={fieldId}
          type={inputType}
          className={`field__input ${icon ? "field__input--with-icon" : ""}`}
          aria-invalid={Boolean(error)}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {reveal ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
      {error ? (
        <span className="field__msg field__msg--error">{error}</span>
      ) : hint ? (
        <span className="field__msg">{hint}</span>
      ) : null}
    </div>
  );
}
