import { useCallback, useEffect, useState } from "react";
import { supervisorService } from "../../services/supervisorService";
import type { RegistroValidacion } from "../../types";
import "../profesor/docencia.css";

function fechaLegible(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });
}

const CHIP: Record<string, string> = {
  VALIDADO: "doc-chip--ok",
  PENDIENTE: "doc-chip--warn",
  RECHAZADO: "doc-chip--bad",
};
const CHIP_TXT: Record<string, string> = {
  VALIDADO: "Validado",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazado",
};

/** HU-40 · Validación de las horas registradas por los practicantes. */
export function ValidarHorasPage() {
  const [soloPendientes, setSoloPendientes] = useState(true);
  const [registros, setRegistros] = useState<RegistroValidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    setLoading(true);
    setError("");
    supervisorService
      .listHoras(soloPendientes)
      .then(setRegistros)
      .catch(() => setError("No se pudieron cargar los registros de horas."))
      .finally(() => setLoading(false));
  }, [soloPendientes]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function decidir(id: string, estado: "VALIDADO" | "RECHAZADO") {
    setBusy(id);
    setError("");
    try {
      const upd = await supervisorService.validarHoras(id, estado);
      if (soloPendientes) {
        // Al resolverlo deja de estar pendiente: sale de la lista.
        setRegistros((prev) => prev.filter((r) => r.id !== id));
      } else {
        setRegistros((prev) => prev.map((r) => (r.id === id ? upd : r)));
      }
    } catch {
      setError("No se pudo actualizar el registro.");
    } finally {
      setBusy("");
    }
  }

  const totalPendiente = registros
    .filter((r) => r.estadoValidacion === "PENDIENTE")
    .reduce((s, r) => s + r.horas, 0);

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Supervisión › Validar horas</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Validar horas</h1>
          <p className="doc__subtitle">
            {soloPendientes
              ? `${registros.length} registro(s) por revisar · ${totalPendiente} horas`
              : `${registros.length} registro(s) en total`}
          </p>
        </div>
      </header>

      <div className="doc__toolbar">
        <label className="doc-check">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
          />
          Mostrar solo pendientes
        </label>
      </div>

      {error && <p className="doc-error">{error}</p>}
      {loading ? (
        <p className="doc-muted">Cargando registros…</p>
      ) : registros.length === 0 ? (
        <p className="doc-muted">
          {soloPendientes
            ? "No hay registros pendientes de validación. ¡Todo al día!"
            : "Aún no hay registros de horas en tu centro."}
        </p>
      ) : (
        registros.map((r) => (
          <div key={r.id} className="doc-card">
            <div className="doc-card__row">
              <div>
                <div className="doc-card__title">{r.practicanteNombre}</div>
                <div className="doc-card__meta">
                  {fechaLegible(r.fecha)} · {r.horas} horas
                </div>
              </div>
              <span className={`doc-chip ${CHIP[r.estadoValidacion]}`}>
                {CHIP_TXT[r.estadoValidacion]}
              </span>
            </div>
            <div className="doc-card__body">{r.descripcion}</div>
            <div className="doc-grade">
              <button
                className="doc-btn"
                onClick={() => decidir(r.id, "VALIDADO")}
                disabled={busy === r.id}
              >
                Validar
              </button>
              <button
                className="doc-btn doc-btn--ghost"
                onClick={() => decidir(r.id, "RECHAZADO")}
                disabled={busy === r.id}
              >
                Rechazar
              </button>
            </div>
          </div>
        ))
      )}

      <p className="doc-muted" style={{ marginTop: 16, fontSize: 12 }}>
        Las horas rechazadas no se contabilizan en el total acumulado del practicante.
      </p>
    </div>
  );
}
