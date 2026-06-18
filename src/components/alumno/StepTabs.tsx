import { Link } from "react-router-dom";
import "./StepTabs.css";

interface Step {
  n: number;
  label: string;
  to?: string;
}

const STEPS: Step[] = [
  { n: 1, label: "Mis aulas", to: "/mis-aulas" },
  { n: 2, label: "Aula virtual" },
  { n: 3, label: "Entregar tarea" },
  { n: 4, label: "Calificaciones" },
];

/**
 * Tabs de pasos del flujo del alumno. `current` marca el paso activo;
 * los pasos sin ruta (`to`) aún no están implementados y se muestran inertes.
 */
export function StepTabs({ current }: { current: number }) {
  return (
    <nav className="steps" aria-label="Pasos">
      {STEPS.map((step) => {
        const isActive = step.n === current;
        const className = `steps__tab ${isActive ? "is-active" : ""} ${
          step.to ? "" : "is-disabled"
        }`;
        const content = (
          <>
            <span className="steps__num">{step.n}.</span> {step.label}
          </>
        );
        return step.to && !isActive ? (
          <Link key={step.n} to={step.to} className={className}>
            {content}
          </Link>
        ) : (
          <span key={step.n} className={className} title={step.to ? "" : "Próximamente"}>
            {content}
          </span>
        );
      })}
    </nav>
  );
}
