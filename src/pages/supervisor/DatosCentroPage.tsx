import { useEffect, useState } from "react";
import { supervisorService } from "../../services/supervisorService";
import type { Centro } from "../../types";
import "../profesor/docencia.css";

/** Campo de formulario etiquetado. */
function Campo({
  label,
  value,
  onChange,
  disabled,
  ayuda,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  ayuda?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="doc-kpi__lbl" style={{ display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <input
        className="doc-input"
        style={{ marginBottom: 2 }}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {ayuda && (
        <span style={{ fontSize: 11, color: "var(--color-text-soft)" }}>{ayuda}</span>
      )}
    </div>
  );
}

/** HU-43 · Datos del centro de prácticas y contacto del supervisor. */
export function DatosCentroPage() {
  const [centro, setCentro] = useState<Centro | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supervisorService
      .getCentro()
      .then(setCentro)
      .catch(() => setError("No se pudieron cargar los datos del centro."))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Centro>(campo: K, valor: Centro[K]) {
    setCentro((prev) => (prev ? { ...prev, [campo]: valor } : prev));
    setMsg("");
  }

  async function guardarCentro() {
    if (!centro) return;
    setGuardando("centro");
    setError("");
    try {
      const upd = await supervisorService.updateCentro({
        razonSocial: centro.razonSocial,
        direccion: centro.direccion,
        sector: centro.sector,
        telefono: centro.telefono,
        email: centro.email,
      });
      setCentro(upd);
      setMsg("Datos del centro actualizados.");
    } catch {
      setError("No se pudieron guardar los datos del centro.");
    } finally {
      setGuardando("");
    }
  }

  async function guardarContacto() {
    if (!centro) return;
    setGuardando("contacto");
    setError("");
    try {
      const upd = await supervisorService.updateContacto({
        nombres: centro.supervisorNombres,
        apellidos: centro.supervisorApellidos,
        cargo: centro.supervisorCargo,
        email: centro.supervisorEmail,
        telefono: centro.supervisorTelefono,
      });
      setCentro(upd);
      setMsg("Datos de contacto actualizados.");
    } catch {
      setError("No se pudieron guardar los datos de contacto.");
    } finally {
      setGuardando("");
    }
  }

  if (loading) return <p className="doc-muted">Cargando datos del centro…</p>;
  if (!centro) return <p className="doc-error">{error || "Centro no disponible."}</p>;

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Cuenta › Datos del centro</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Datos del centro</h1>
          <p className="doc__subtitle">
            {centro.practicantes} practicante(s) asignado(s) a este centro
          </p>
        </div>
        {msg && <span className="doc-chip doc-chip--ok">{msg}</span>}
      </header>

      {error && <p className="doc-error">{error}</p>}

      <div className="doc-form">
        <div className="doc-card__title" style={{ marginBottom: 12 }}>
          Información del centro de prácticas
        </div>
        <Campo label="RUC" value={centro.ruc} disabled ayuda="El RUC identifica al centro y no puede modificarse." />
        <Campo label="Razón social" value={centro.razonSocial} onChange={(v) => set("razonSocial", v)} />
        <Campo label="Dirección" value={centro.direccion} onChange={(v) => set("direccion", v)} />
        <Campo label="Sector" value={centro.sector} onChange={(v) => set("sector", v)} />
        <Campo label="Teléfono" value={centro.telefono} onChange={(v) => set("telefono", v)} />
        <Campo label="Correo del centro" value={centro.email} onChange={(v) => set("email", v)} />
        <button className="doc-btn" onClick={guardarCentro} disabled={guardando === "centro"}>
          {guardando === "centro" ? "Guardando…" : "Guardar datos del centro"}
        </button>
        <p className="doc-muted" style={{ fontSize: 11.5, marginTop: 8 }}>
          Estos datos se actualizan en la ficha de todos los practicantes del centro.
        </p>
      </div>

      <div className="doc-form">
        <div className="doc-card__title" style={{ marginBottom: 12 }}>
          Contacto del supervisor
        </div>
        <Campo label="Nombres" value={centro.supervisorNombres} onChange={(v) => set("supervisorNombres", v)} />
        <Campo label="Apellidos" value={centro.supervisorApellidos} onChange={(v) => set("supervisorApellidos", v)} />
        <Campo label="Cargo" value={centro.supervisorCargo} onChange={(v) => set("supervisorCargo", v)} />
        <Campo label="Correo" value={centro.supervisorEmail} onChange={(v) => set("supervisorEmail", v)} />
        <Campo label="Teléfono" value={centro.supervisorTelefono} onChange={(v) => set("supervisorTelefono", v)} />
        <button className="doc-btn" onClick={guardarContacto} disabled={guardando === "contacto"}>
          {guardando === "contacto" ? "Guardando…" : "Guardar contacto"}
        </button>
      </div>
    </div>
  );
}
