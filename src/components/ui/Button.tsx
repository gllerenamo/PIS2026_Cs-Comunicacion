import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

/** Botón base del design system. */
export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} ${fullWidth ? "btn--block" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
