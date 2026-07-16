import { useCallback, useEffect, useState } from "react";
import { AulaSelect } from "../../components/profesor/AulaSelect";
import { profesorService } from "../../services/profesorService";
import type { AsistenciaItem } from "../../types";
import "./docencia.css";

/** Fecha de hoy en formato YYYY-MM-DD (zona local). */
function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** HU-25 · Registro de asistencia por sesión (profesor). */
export function AsistenciaPage() {
  const [aulaId, setAulaId] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [items, setItems] = useState<AsistenciaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    if (!aulaId) return;
    setLoading(true);
    setMsg("");
    setError("");
    profesorService
      .getAsistencia(aulaId, fecha)
      .then((s) => setItems(s.items))
      .catch(() => setError("No se pudo cargar la asistencia."))
      .finally(() => setLoading(false));
  }, [aulaId, fecha]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function marcar(practicanteId: string, presente: boolean) {
    setItems((prev) =>
      prev.map((it) => (it.practicanteId === practicanteId ? { ...it, presente } : it)),
    );
    setMsg("");
  }

  async function guardar() {
    setSaving(true);
    setError("");
    try {
      await profesorService.guardarAsistencia(
        aulaId,
        fecha,
        items.map((it) => ({ practicanteId: it.practicanteId, presente: it.presente })),
      );
      setMsg("Asistencia guardada.");
    } catch {
      setError("No se pudo guardar la asistencia.");
    } finally {
      setSaving(false);
    }
  }

  const presentes = items.filter((it) => it.presente).length;
  const ausentes = items.length - presentes;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Docencia › Asistencia</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Registro de asistencia</h1>
          <p className="doc__subtitle">
            {items.length > 0
              ? `${presentes} presente(s) · ${ausentes} ausente(s) · ${items.length} practicantes`
              : "Selecciona el aula y la fecha de la sesión"}
          </p>
        </div>
      </header>

      <div className="doc__toolbar">
        <AulaSelect value={aulaId} onChange={(id) => setAulaId(id)} />
        <input
          type="date"
          className="doc-date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <button className="doc-btn" onClick={guardar} disabled={saving || items.length === 0}>
          {saving ? "Guardando…" : "Guardar registro"}
        </button>
        {msg && <span className="doc-chip doc-chip--ok">{msg}</span>}
      </div>

      {error && <p className="doc-error">{error}</p>}
      {loading ? (
        <p className="doc-muted">Cargando practicantes…</p>
      ) : items.length === 0 ? (
        <p className="doc-muted">No hay practicantes inscritos en esta aula.</p>
      ) : (
        items.map((it) => (
          <div key={it.practicanteId} className="doc-att">
            <span className="doc-att__name">{it.practicanteNombre}</span>
            <div className="doc-att__toggle">
              <button
                className={`doc-att__btn ${it.presente ? "is-on-p" : ""}`}
                onClick={() => marcar(it.practicanteId, true)}
              >
                Presente
              </button>
              <button
                className={`doc-att__btn ${!it.presente ? "is-on-a" : ""}`}
                onClick={() => marcar(it.practicanteId, false)}
              >
                Ausente
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
