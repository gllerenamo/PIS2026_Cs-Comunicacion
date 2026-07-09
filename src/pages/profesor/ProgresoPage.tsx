import { useEffect, useState } from "react";
import { profesorService } from "../../services/profesorService";
import type { PracticanteProgreso } from "../../types";
import "./ProgresoPage.css";

/** Agrupa practicantes por aula. */
function agrupar(lista: PracticanteProgreso[]): Map<string, PracticanteProgreso[]> {
  const mapa = new Map<string, PracticanteProgreso[]>();
  for (const p of lista) {
    if (!mapa.has(p.aulaId)) mapa.set(p.aulaId, []);
    mapa.get(p.aulaId)!.push(p);
  }
  return mapa;
}

/** HU-11 · Visualizador de progreso de practicantes (rol Profesor/Admin). */
export function ProgresoPage() {
  const [practicantes, setPracticantes] = useState<PracticanteProgreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    profesorService
      .listPracticantes()
      .then(setPracticantes)
      .catch(() => setError("No se pudo cargar el progreso de los practicantes."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="progreso-page__muted">Cargando practicantes…</p>;
  if (error) return <p className="progreso-page__error">{error}</p>;
  if (practicantes.length === 0)
    return <p className="progreso-page__muted">No tienes practicantes inscritos aún.</p>;

  const grupos = agrupar(practicantes);

  return (
    <div className="progreso-page">
      <p className="progreso-page__breadcrumb">Inicio › Progreso practicantes</p>
      <header className="progreso-page__head">
        <h1 className="progreso-page__title">Progreso de practicantes</h1>
        <p className="progreso-page__subtitle">
          {practicantes.length} practicante{practicantes.length !== 1 ? "s" : ""} en{" "}
          {grupos.size} aula{grupos.size !== 1 ? "s" : ""}
        </p>
      </header>

      {Array.from(grupos.entries()).map(([aulaId, lista]) => {
        const aula = lista[0];
        return (
          <section key={aulaId} className="progreso-grupo">
            <div className="progreso-grupo__header">
              <h2 className="progreso-grupo__titulo">{aula.aulaNombre}</h2>
              <span
                className={`badge badge--${aula.estado.toLowerCase()}`}
              >
                {aula.estado === "ACTIVA" ? "Activa" : "Concluida"}
              </span>
            </div>

            <div className="progreso-table-wrap">
              <table className="progreso-table">
                <thead>
                  <tr>
                    <th>Practicante</th>
                    <th>Correo</th>
                    <th>Progreso</th>
                    <th>Semana</th>
                    <th>Tareas</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((p) => (
                    <tr key={p.alumnoId}>
                      <td className="progreso-table__nombre">{p.alumnoNombre}</td>
                      <td className="progreso-table__email">{p.alumnoEmail}</td>
                      <td className="progreso-table__progreso">
                        <div className="progreso-bar-wrap">
                          <div
                            className="progreso-bar"
                            style={{ width: `${p.progreso}%` }}
                          />
                        </div>
                        <span className="progreso-pct">{p.progreso}%</span>
                      </td>
                      <td className="progreso-table__semana">
                        {p.semanaActual}/{p.semanasTotales}
                      </td>
                      <td className="progreso-table__tareas">
                        {p.tareasEntregadas}/{p.tareasTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
