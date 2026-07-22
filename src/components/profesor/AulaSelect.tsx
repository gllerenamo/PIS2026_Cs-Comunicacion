import { useEffect, useState } from "react";
import { aulaService } from "../../services/aulaService";
import { alumnoService } from "../../services/alumnoService";
import { useAuth } from "../../hooks/useAuth";

interface Opcion {
  id: string;
  etiqueta: string;
}

interface Props {
  value: string;
  onChange: (aulaId: string) => void;
}

/**
 * Selector del aula sobre la que trabajan las vistas de docencia y comunicación.
 * Según el rol usa una fuente distinta: el profesor/admin ve las aulas que
 * gestiona y el alumno solo aquellas en las que está matriculado.
 * Auto-selecciona la primera para que la vista muestre datos sin un paso extra.
 */
export function AulaSelect({ value, onChange }: Props) {
  const { user } = useAuth();
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const cargar =
      user.role === "ALUMNO"
        ? alumnoService
            .listMisAulas(user)
            .then((as) =>
              as.map((a) => ({ id: a.id, etiqueta: `${a.nombre} · ${a.ciclo}` })),
            )
        : aulaService
            .list(user)
            .then((as) =>
              as.map((a) => ({ id: a.id, etiqueta: `${a.nombre} · ${a.periodo}` })),
            );

    cargar
      .then((lista) => {
        setOpciones(lista);
        if (lista.length > 0 && !value) onChange(lista[0].id);
      })
      .catch(() => setOpciones([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <span className="doc-muted">Cargando aulas…</span>;
  if (opciones.length === 0)
    return <span className="doc-muted">No tienes aulas disponibles.</span>;

  return (
    <select
      className="doc-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {opciones.map((o) => (
        <option key={o.id} value={o.id}>
          {o.etiqueta}
        </option>
      ))}
    </select>
  );
}
