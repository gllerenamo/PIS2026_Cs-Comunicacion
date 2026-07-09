import { useEffect, useState } from "react";
import { tareaService } from "../../services/tareaService";
import type { TareaAlumno } from "../../types";
import { EntregarModal } from "./EntregarModal";
import "./TareasPanel.css";

function formatFecha(iso: string | null): string {
  if (!iso) return "Sin fecha límite";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  aulaId: string;
}

/** Panel de tareas con estado de entrega y modal de envío (HU-09). */
export function TareasPanel({ aulaId }: Props) {
  const [tareas, setTareas] = useState<TareaAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tareaActiva, setTareaActiva] = useState<TareaAlumno | null>(null);

  useEffect(() => {
    tareaService
      .listTareas(aulaId)
      .then(setTareas)
      .catch(() => setError("No se pudieron cargar las tareas."))
      .finally(() => setLoading(false));
  }, [aulaId]);

  function handleSuccess(actualizada: TareaAlumno) {
    setTareas((prev) =>
      prev.map((t) => (t.id === actualizada.id ? actualizada : t))
    );
    setTareaActiva(null);
  }

  if (loading) return <p className="tareas-panel__muted">Cargando tareas…</p>;
  if (error) return <p className="tareas-panel__error">{error}</p>;
  if (tareas.length === 0)
    return <p className="tareas-panel__muted">No hay tareas asignadas aún.</p>;

  return (
    <>
      <ul className="tareas-list">
        {tareas.map((t) => {
          const entregada = t.entrega !== null;
          const calificada = t.entrega?.estado === "CALIFICADA";

          return (
            <li key={t.id} className="tarea-item">
              <div className="tarea-item__info">
                <p className="tarea-item__titulo">{t.titulo}</p>
                <p className="tarea-item__desc">{t.descripcion}</p>
                <p className="tarea-item__fecha">
                  Fecha límite: {formatFecha(t.fechaLimite)}
                </p>
              </div>

              <div className="tarea-item__right">
                {calificada ? (
                  <span className="badge badge--calificada">
                    {t.entrega!.nota}/20
                  </span>
                ) : entregada ? (
                  <span className="badge badge--sin_leer">Entregada</span>
                ) : (
                  <span className="badge badge--pendiente">Pendiente</span>
                )}

                {!entregada && (
                  <button
                    className="tarea-item__btn"
                    onClick={() => setTareaActiva(t)}
                  >
                    Entregar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {tareaActiva && (
        <EntregarModal
          tarea={tareaActiva}
          aulaId={aulaId}
          onClose={() => setTareaActiva(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
