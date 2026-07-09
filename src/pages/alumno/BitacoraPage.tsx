import { useEffect, useState } from "react";
import { BitacoraPanel } from "../../components/alumno/BitacoraPanel";
import { practicaService } from "../../services/practicaService";
import { useAuth } from "../../hooks/useAuth";
import type { Practica } from "../../types";
import "./AulaVirtualPage.css";

/** HU-14 · Mi bitácora — registro de horas del ciclo de prácticas activo. */
export function BitacoraPage() {
  const { user } = useAuth();
  const [practica, setPractica] = useState<Practica | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    practicaService
      .getActual(user)
      .then(setPractica)
      .catch(() => setPractica(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="aula-v__loading">Cargando bitácora…</p>;

  return (
    <div className="aula-v">
      <p className="aula-v__breadcrumb">Inicio › Mi bitácora</p>

      <header className="aula-v__head">
        <h1 className="aula-v__title">Mi bitácora</h1>
        <p className="aula-v__meta">
          {practica
            ? `${practica.aulaNombre} · ${practica.periodo}`
            : "Registro de horas de tu práctica activa"}
        </p>
      </header>

      <section className="aula-v__panel" role="region">
        {practica ? (
          <BitacoraPanel aulaId={practica.aulaId} />
        ) : (
          <p className="aula-v__placeholder">
            Aún no tienes un ciclo de prácticas activo con bitácora.
          </p>
        )}
      </section>
    </div>
  );
}
