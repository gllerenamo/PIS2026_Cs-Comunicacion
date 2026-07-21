import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { practicaService } from "../../services/practicaService";
import type { Practica, RegistroHoras } from "../../types";
import "./BitacoraPanel.css";

interface Props {
  aulaId: string;
}

/** Etiqueta del estado de validación que asigna el supervisor del centro (HU-40). */
const VALIDACION_TXT: Record<string, string> = {
  PENDIENTE: "Por validar",
  VALIDADO: "Validado",
  RECHAZADO: "Rechazado",
};

/** Caja de fecha (día grande + mes) al estilo del mockup. */
function fechaCaja(iso: string): { dia: string; mes: string } {
  if (!iso) return { dia: "—", mes: "" };
  const d = new Date(iso);
  return {
    dia: String(d.getDate()),
    mes: d.toLocaleDateString("es-PE", { month: "short" }).replace(".", ""),
  };
}

/** Agrupa los registros por "mes año" para el encabezado de cada bloque. */
function periodoTitulo(iso: string): string {
  if (!iso) return "Sin fecha";
  const d = new Date(iso);
  const t = d.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** HU-14 · Bitácora de actividades y horas del practicante dentro del aula. */
export function BitacoraPanel({ aulaId }: Props) {
  const [practica, setPractica] = useState<Practica | null>(null);
  const [registros, setRegistros] = useState<RegistroHoras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [horas, setHoras] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let activo = true;
    setLoading(true);
    practicaService
      .getPorAula(aulaId)
      .then((p) => {
        if (!activo) return;
        setPractica(p);
        if (p) return practicaService.getHoras(p.id).then(setRegistros);
      })
      .catch(() => activo && setError("No se pudo cargar la bitácora."))
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [aulaId]);

  const cerrada = practica?.estado === "CERRADA";

  const pct = practica
    ? Math.min(
        100,
        Math.round((practica.horasAcumuladas / practica.horasMinimas) * 100),
      )
    : 0;

  /** Registros agrupados por periodo (mes) manteniendo el orden recibido. */
  const grupos = useMemo(() => {
    const mapa = new Map<string, RegistroHoras[]>();
    for (const r of registros) {
      const key = periodoTitulo(r.fecha);
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(r);
    }
    return Array.from(mapa.entries());
  }, [registros]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const n = Number(horas);
    if (!horas || Number.isNaN(n) || n <= 0) {
      setFormError("Ingresa un número de horas mayor a 0.");
      return;
    }
    if (!descripcion.trim()) {
      setFormError("Describe brevemente la actividad realizada.");
      return;
    }
    if (!practica) return;
    setSaving(true);
    try {
      const { practica: actualizada, registro } =
        await practicaService.registrarHoras(practica.id, {
          horas: n,
          descripcion: descripcion.trim(),
        });
      setPractica(actualizada);
      setRegistros((prev) => [registro, ...prev]);
      setHoras("");
      setDescripcion("");
      setShowForm(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudieron registrar las horas.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="bita__muted">Cargando bitácora…</p>;
  if (error) return <p className="bita__error">{error}</p>;
  if (!practica)
    return (
      <p className="bita__muted">
        Aún no tienes un ciclo de prácticas asociado a esta aula.
      </p>
    );

  return (
    <div className="bita">
      <div className="bita__head">
        <h3 className="bita__title">Registros de actividades</h3>
        {!cerrada && (
          <button
            className="bita__new-btn"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancelar" : "+ Nuevo registro"}
          </button>
        )}
      </div>

      {showForm && !cerrada && (
        <form className="bita__form" onSubmit={handleSubmit}>
          {formError && <p className="bita__error">{formError}</p>}
          <div className="bita__form-row">
            <label className="bita__field bita__field--horas">
              <span className="bita__label">Horas</span>
              <input
                type="number"
                min={1}
                className="bita__input"
                placeholder="8"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
              />
            </label>
            <label className="bita__field">
              <span className="bita__label">Actividad realizada</span>
              <input
                type="text"
                className="bita__input"
                placeholder="Cobertura noticiosa en Radio Impacto"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </label>
          </div>
          <div className="bita__form-actions">
            <button type="submit" className="bita__save-btn" disabled={saving}>
              {saving ? "Guardando…" : "Registrar horas"}
            </button>
          </div>
        </form>
      )}

      {registros.length === 0 ? (
        <p className="bita__muted">Aún no registras actividades en esta aula.</p>
      ) : (
        grupos.map(([periodo, items]) => (
          <div key={periodo} className="bita__group">
            <p className="bita__group-title">{periodo}</p>
            {items.map((r) => {
              const { dia, mes } = fechaCaja(r.fecha);
              return (
                <div key={r.id} className="bita-item">
                  <div className="bita-item__date">
                    <span className="bita-item__day">{dia}</span>
                    <span className="bita-item__month">{mes}</span>
                  </div>
                  <span className="bita-item__sep" aria-hidden="true" />
                  <div className="bita-item__info">
                    <span className="bita-item__act">{r.descripcion}</span>
                    <span className="bita-item__sub">{r.horas} horas</span>
                  </div>
                  <span
                    className={`bita-item__estado bita-item__estado--${r.estadoValidacion.toLowerCase()}`}
                  >
                    {VALIDACION_TXT[r.estadoValidacion]}
                  </span>
                  <span className="bita-item__hours">{r.horas} h</span>
                </div>
              );
            })}
          </div>
        ))
      )}

      <div className="bita__total">
        <span className="bita__total-label">Total horas acumuladas</span>
        <span className="bita__total-value">
          {practica.horasAcumuladas} / {practica.horasMinimas} h
        </span>
      </div>
      <div className="bita__total-bar">
        <div className="bita__total-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
