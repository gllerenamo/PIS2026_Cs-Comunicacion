import { useEffect, useState } from "react";
import { SelectField } from "../../components/ui/SelectField";
import { practicaService } from "../../services/practicaService";
import type { Practica, User } from "../../types";
import "../practicas.css";

const ESTADO_LABEL: Record<Practica["estado"], string> = {
  EN_CURSO: "En curso",
  LISTA_PARA_CIERRE: "Lista para cierre",
  CERRADA: "Cerrada",
};
const ESTADO_TONE: Record<Practica["estado"], "success" | "warning" | "muted"> = {
  EN_CURSO: "warning",
  LISTA_PARA_CIERRE: "success",
  CERRADA: "muted",
};

/** HU-18 · Historial completo de prácticas de un practicante (trazabilidad académica). */
export function HistorialPage() {
  const [practicantes, setPracticantes] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [historial, setHistorial] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    practicaService.listPracticantes().then((list) => {
      setPracticantes(list);
      setSelectedId(list[0]?.id ?? "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setHistorial([]);
      return;
    }
    practicaService.historial(selectedId).then(setHistorial);
  }, [selectedId]);

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Historial de prácticas por practicante</h1>
          <p className="pg__subtitle">
            Trazabilidad académica de todos los ciclos cursados en el sistema.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : practicantes.length === 0 ? (
        <div className="empty">
          <p>Aún no hay practicantes registrados en el sistema.</p>
        </div>
      ) : (
        <div className="card">
          <div className="select-bar">
            <SelectField
              label="Practicante"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              options={practicantes.map((p) => ({
                value: p.id,
                label: `${p.nombres} ${p.apellidos}`,
              }))}
            />
          </div>

          {historial.length === 0 ? (
            <p className="pg__subtitle">Este practicante no tiene ciclos registrados.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Clase / práctica</th>
                  <th>Periodo</th>
                  <th>Horas</th>
                  <th>Estado</th>
                  <th>Cierre</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((p) => (
                  <tr key={p.id}>
                    <td>{p.aulaNombre}</td>
                    <td>{p.periodo}</td>
                    <td>
                      {p.horasAcumuladas}/{p.horasMinimas}
                    </td>
                    <td>
                      <span className={`badge badge--${ESTADO_TONE[p.estado]}`}>
                        {ESTADO_LABEL[p.estado]}
                      </span>
                    </td>
                    <td>
                      {p.fechaCierre
                        ? new Date(p.fechaCierre).toLocaleDateString("es-PE")
                        : "—"}
                      {p.validadoPor && (
                        <div className="list-item__desc">Validado por {p.validadoPor}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
