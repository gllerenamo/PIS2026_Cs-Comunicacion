import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { Alert } from "../../components/ui/Alert";
import { practicaService } from "../../services/practicaService";
import { useAuth } from "../../hooks/useAuth";
import type { Practica, RegistroHoras } from "../../types";
import { isRequired, errorMessage } from "../../utils/validators";
import "../practicas.css";

interface HorasForm {
  horas: string;
  descripcion: string;
}
const EMPTY: HorasForm = { horas: "", descripcion: "" };

/** HU-14 · Seguimiento de horas acumuladas frente al mínimo reglamentario. */
export function HorasPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [practica, setPractica] = useState<Practica | null>(null);
  const [registros, setRegistros] = useState<RegistroHoras[]>([]);

  const [form, setForm] = useState<HorasForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof HorasForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    practicaService.getActual(user).then((p) => {
      setPractica(p);
      setLoading(false);
      if (p) practicaService.getHoras(p.id).then(setRegistros);
    });
  }, [user]);

  if (!user) return null;

  function update<K extends keyof HorasForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    const n = Number(form.horas);
    if (!isRequired(form.horas) || Number.isNaN(n) || n <= 0) {
      next.horas = "Ingresa un número de horas mayor a 0.";
    }
    if (!isRequired(form.descripcion)) {
      next.descripcion = "Describe brevemente la actividad realizada.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate() || !practica) return;
    setSaving(true);
    try {
      const { practica: actualizada, registro } = await practicaService.registrarHoras(
        practica.id,
        { horas: Number(form.horas), descripcion: form.descripcion },
      );
      setPractica(actualizada);
      setRegistros((prev) => [registro, ...prev]);
      setForm(EMPTY);
    } catch (err) {
      setApiError(errorMessage(err, "No se pudieron registrar las horas."));
    } finally {
      setSaving(false);
    }
  }

  const pct = practica
    ? Math.min(100, Math.round((practica.horasAcumuladas / practica.horasMinimas) * 100))
    : 0;
  const cumplido = practica ? practica.horasAcumuladas >= practica.horasMinimas : false;

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Horas acumuladas</h1>
          <p className="pg__subtitle">
            Cumplimiento del mínimo exigido por el Reglamento RCU 0501-2020 de la UNSA.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : !practica ? (
        <div className="empty">
          <p>Aún no tienes un ciclo de prácticas activo.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="card__title">{practica.aulaNombre} · {practica.periodo}</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13.5 }}>
              <span>
                <strong>{practica.horasAcumuladas}</strong> / {practica.horasMinimas} horas
              </span>
              <span
                className={`badge ${cumplido ? "badge--success" : "badge--warning"}`}
              >
                {cumplido ? "Mínimo cumplido" : `${pct}% completado`}
              </span>
            </div>
            <div className="progress">
              <div
                className={`progress__fill ${cumplido ? "progress__fill--done" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {practica.estado !== "CERRADA" && (
            <div className="card">
              <h2 className="card__title">Registrar horas trabajadas</h2>
              <form onSubmit={handleSubmit} noValidate>
                {apiError && <Alert tone="error">{apiError}</Alert>}
                <div className="form-row">
                  <TextField
                    label="Horas"
                    type="number"
                    min={1}
                    placeholder="8"
                    value={form.horas}
                    onChange={(e) => update("horas", e.target.value)}
                    error={errors.horas}
                  />
                  <TextField
                    label="Descripción de la actividad"
                    placeholder="Cobertura de eventos institucionales"
                    value={form.descripcion}
                    onChange={(e) => update("descripcion", e.target.value)}
                    error={errors.descripcion}
                  />
                </div>
                <div className="form-actions">
                  <Button type="submit" loading={saving}>
                    Registrar horas
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <h2 className="card__title">Bitácora de horas</h2>
            {registros.length === 0 ? (
              <p className="pg__subtitle">Aún no registras horas.</p>
            ) : (
              <div className="list">
                {registros.map((r) => (
                  <div key={r.id} className="list-item">
                    <div>
                      <div>{r.descripcion}</div>
                      <div className="list-item__desc">
                        {new Date(r.fecha).toLocaleDateString("es-PE")}
                      </div>
                    </div>
                    <strong>{r.horas}h</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
