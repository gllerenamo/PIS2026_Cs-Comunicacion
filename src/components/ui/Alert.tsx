import type { ReactNode } from "react";
import "./Alert.css";

type Tone = "error" | "success" | "info";

/** Mensaje contextual (error de API, confirmación, aviso). */
export function Alert({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div className={`alert alert--${tone}`} role="alert">
      {children}
    </div>
  );
}
