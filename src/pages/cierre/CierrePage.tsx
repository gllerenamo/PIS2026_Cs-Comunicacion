import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { practicaService } from "../../services/practicaService";
import { useAuth } from "../../hooks/useAuth";
import type { Practica } from "../../types";
import { errorMessage } from "../../utils/validators";
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

/** HU-15 · Cierre y validación formal de prácticas por el docente. */
export function CierrePage() {
  const { user } = useAuth();
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    practicaService.list(user).then((list) => {
      setPracticas(list);
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  async function handleCerrar(practica: Practica) {
    if (!user) return;
    setErrors((prev) => ({ ...prev, [practica.id]: "" }));
    setClosingId(practica.id);
    try {
      const cerrada = await practicaService.cerrar(practica.id, user);
      setPracticas((prev) => prev.map((p) => (p.id === cerrada.id ? cerrada : p)));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [practica.id]: errorMessage(err, "No se pudo cerrar la práctica."),
      }));
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Cierre y validación de prácticas</h1>
          <p className="pg__subtitle">
            Valida formalmente las prácticas que cumplieron todos los requisitos.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : practicas.length === 0 ? (
        <div className="empty">
          <p>No hay prácticas asociadas a tus clases.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Practicante</th>
                <th>Clase / periodo</th>
                <th>Horas</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {practicas.map((p) => (
                <tr key={p.id}>
                  <td>{p.practicanteNombre}</td>
                  <td>
                    {p.aulaNombre}
                    <br />
                    <span className="list-item__desc">{p.periodo}</span>
                  </td>
                  <td>
                    {p.horasAcumuladas}/{p.horasMinimas}
                  </td>
                  <td>
                    <span className={`badge badge--${ESTADO_TONE[p.estado]}`}>
                      {ESTADO_LABEL[p.estado]}
                    </span>
                    {p.estado === "CERRADA" && p.validadoPor && (
                      <div className="list-item__desc" style={{ marginTop: 4 }}>
                        Validado por {p.validadoPor}
                      </div>
                    )}
                  </td>
                  <td>
                    {p.estado !== "CERRADA" && (
                      <Button
                        variant="secondary"
                        loading={closingId === p.id}
                        onClick={() => handleCerrar(p)}
                      >
                        Validar y cerrar
                      </Button>
                    )}
                    {errors[p.id] && (
                      <div style={{ marginTop: 8 }}>
                        <Alert tone="error">{errors[p.id]}</Alert>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
