import { useEffect, useState } from "react";
import { aulaService } from "../../services/aulaService";
import { useAuth } from "../../hooks/useAuth";
import type { Aula } from "../../types";

interface Props {
  value: string;
  onChange: (aulaId: string, aula: Aula | null) => void;
  /** Si true, incluye también aulas concluidas (por defecto solo activas primero). */
}

/**
 * Selector de las aulas que dicta el profesor (o todas, si es admin).
 * Auto-selecciona la primera aula al cargar para que las vistas de docencia
 * (asistencia, libro, seguimiento) muestren datos sin un paso extra.
 */
export function AulaSelect({ value, onChange }: Props) {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    aulaService
      .list(user)
      .then((lista) => {
        setAulas(lista);
        if (lista.length > 0 && !value) onChange(lista[0].id, lista[0]);
      })
      .catch(() => setAulas([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <span className="doc-muted">Cargando aulas…</span>;
  if (aulas.length === 0) return <span className="doc-muted">No tienes aulas asignadas.</span>;

  return (
    <select
      className="doc-select"
      value={value}
      onChange={(e) => {
        const aula = aulas.find((a) => a.id === e.target.value) ?? null;
        onChange(e.target.value, aula);
      }}
    >
      {aulas.map((a) => (
        <option key={a.id} value={a.id}>
          {a.nombre} · {a.periodo}
        </option>
      ))}
    </select>
  );
}
