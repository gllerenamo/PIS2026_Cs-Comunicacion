import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { SelectField } from "../../components/ui/SelectField";
import { TextField } from "../../components/ui/TextField";
import { useAuth } from "../../hooks/useAuth";
import { metaService } from "../../services/metaService";
import { practicaService } from "../../services/practicaService";
import type { CreateMetaPayload, Meta, MetaTipo, Practica, User } from "../../types";
import { errorMessage, isRequired } from "../../utils/validators";
import "../practicas.css";

const TIPO_LABEL: Record<MetaTipo, string> = {
  ARTICULOS: "Artículos",
  NOTAS_PERIODISTICAS: "Notas periodísticas",
  NOTAS_PRENSA: "Notas de prensa",
  HORAS: "Horas trabajadas",
};

/** Metas cuyo avance se calcula solo y no admite registro manual (HU-14). */
const TIPOS_AVANCE_AUTOMATICO: MetaTipo[] = ["HORAS"];

const TIPO_OPTIONS = (Object.keys(TIPO_LABEL) as MetaTipo[]).map((value) => ({
  value,
  label: TIPO_LABEL[value],
}));

interface NewMeta {
  tipo: MetaTipo;
  cantidadObjetivo: string;
  descripcion: string;
}

const EMPTY: NewMeta = { tipo: "ARTICULOS", cantidadObjetivo: "", descripcion: "" };

function MetaCard({
  meta,
  children,
}: {
  meta: Meta;
  children?: ReactNode;
}) {
  const pct = Math.min(
    100,
    Math.round((meta.cantidadAlcanzada / meta.cantidadObjetivo) * 100),
  );
  const restante = Math.max(0, meta.cantidadObjetivo - meta.cantidadAlcanzada);
  const cumplida = meta.cantidadAlcanzada >= meta.cantidadObjetivo;
  return (
    <li className="list-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{TIPO_LABEL[meta.tipo]}</strong>
        <span className={`badge badge--${cumplida ? "success" : "warning"}`}>
          {meta.cantidadAlcanzada}/{meta.cantidadObjetivo}
        </span>
      </div>
      {meta.descripcion && <p className="list-item__desc">{meta.descripcion}</p>}
      <div className="progress">
        <div
          className={`progress__fill ${cumplida ? "progress__fill--done" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="list-item__desc">
        {cumplida ? "Meta cumplida." : `Faltan ${restante} para completar la meta (${pct}%).`}
      </p>
      {children}
    </li>
  );
}

/** HU-20 · El asesor define metas cuantitativas por practicante para medir su avance real. */
export function MetasPage() {
  const { user } = useAuth();

  if (!user) return null;
  if (user.role === "ALUMNO") return <MetasAlumno user={user} />;
  return <MetasGestion user={user} />;
}

function MetasAlumno({ user }: { user: User }) {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaService
      .list(user)
      .then(setMetas)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Mi progreso por metas</h1>
          <p className="pg__subtitle">
            Metas definidas por tu asesor y cuánto te falta para completarlas.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : metas.length === 0 ? (
        <div className="empty">
          <p>Tu asesor aún no definió metas para tus prácticas.</p>
        </div>
      ) : (
        <div className="card">
          <ul className="list">
            {metas.map((meta) => (
              <MetaCard key={meta.id} meta={meta} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MetasGestion({ user }: { user: User }) {
  const [practicantes, setPracticantes] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [practicaActual, setPracticaActual] = useState<Practica | null>(null);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMetas, setLoadingMetas] = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewMeta>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof NewMeta, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [avanceDrafts, setAvanceDrafts] = useState<Record<string, string>>({});
  const [avanceErrors, setAvanceErrors] = useState<Record<string, string>>({});
  const [registrandoId, setRegistrandoId] = useState<string | null>(null);

  useEffect(() => {
    practicaService.listPracticantes().then((list) => {
      setPracticantes(list);
      setSelectedId(list[0]?.id ?? "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setPracticaActual(null);
      setMetas([]);
      return;
    }
    setLoadingMetas(true);
    practicaService.historial(selectedId).then(async (ciclos) => {
      const actual = ciclos.find((p) => p.estado !== "CERRADA") ?? ciclos[0] ?? null;
      setPracticaActual(actual);
      const lista = actual ? await metaService.listByPracticante(selectedId) : [];
      setMetas(actual ? lista.filter((m) => m.practicaId === actual.id) : []);
      setLoadingMetas(false);
    });
  }, [selectedId]);

  function update<K extends keyof NewMeta>(key: K, value: NewMeta[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openModal() {
    setForm(EMPTY);
    setErrors({});
    setApiError(null);
    setOpen(true);
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!isRequired(form.cantidadObjetivo)) {
      next.cantidadObjetivo = "Ingresa la cantidad objetivo.";
    } else if (Number(form.cantidadObjetivo) <= 0) {
      next.cantidadObjetivo = "Debe ser un número mayor a 0.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate() || !practicaActual) return;

    const payload: CreateMetaPayload = {
      tipo: form.tipo,
      cantidadObjetivo: Number(form.cantidadObjetivo),
      descripcion: form.descripcion || undefined,
    };

    setSaving(true);
    try {
      const created = await metaService.create(practicaActual.id, payload, user);
      setMetas((prev) => [created, ...prev]);
      setOpen(false);
    } catch (err) {
      setApiError(errorMessage(err, "No se pudo registrar la meta."));
    } finally {
      setSaving(false);
    }
  }

  async function handleRegistrarAvance(meta: Meta) {
    const raw = avanceDrafts[meta.id];
    const cantidad = Number(raw);
    if (!raw || cantidad <= 0) {
      setAvanceErrors((prev) => ({ ...prev, [meta.id]: "Ingresa una cantidad mayor a 0." }));
      return;
    }
    setAvanceErrors((prev) => ({ ...prev, [meta.id]: "" }));
    setRegistrandoId(meta.id);
    try {
      const actualizada = await metaService.registrarAvance(meta.id, { cantidad }, user);
      setMetas((prev) => prev.map((m) => (m.id === meta.id ? actualizada : m)));
      setAvanceDrafts((prev) => ({ ...prev, [meta.id]: "" }));
    } catch (err) {
      setAvanceErrors((prev) => ({
        ...prev,
        [meta.id]: errorMessage(err, "No se pudo registrar el avance."),
      }));
    } finally {
      setRegistrandoId(null);
    }
  }

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Metas por practicante</h1>
          <p className="pg__subtitle">
            Define metas cuantitativas (artículos, notas periodísticas, notas
            de prensa) y registra el avance real de cada practicante.
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
            <Button
              onClick={openModal}
              disabled={!practicaActual}
              title={
                practicaActual
                  ? undefined
                  : "El practicante no tiene un ciclo de prácticas registrado."
              }
            >
              + Nueva meta
            </Button>
          </div>

          {loadingMetas ? (
            <p className="pg__subtitle">Cargando metas…</p>
          ) : !practicaActual ? (
            <p className="pg__subtitle">
              Este practicante no tiene un ciclo de prácticas registrado.
            </p>
          ) : metas.length === 0 ? (
            <p className="pg__subtitle">Aún no se definieron metas para este practicante.</p>
          ) : (
            <ul className="list">
              {metas.map((meta) =>
                TIPOS_AVANCE_AUTOMATICO.includes(meta.tipo) ? (
                  <MetaCard key={meta.id} meta={meta}>
                    <p className="list-item__desc">
                      El avance se calcula automáticamente desde la bitácora de
                      horas acumuladas (HU-14).
                    </p>
                  </MetaCard>
                ) : (
                  <MetaCard key={meta.id} meta={meta}>
                    <div className="form-row">
                      <TextField
                        label="Registrar avance"
                        type="number"
                        min={1}
                        placeholder="Cantidad producida"
                        value={avanceDrafts[meta.id] ?? ""}
                        onChange={(e) =>
                          setAvanceDrafts((prev) => ({ ...prev, [meta.id]: e.target.value }))
                        }
                        error={avanceErrors[meta.id]}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        loading={registrandoId === meta.id}
                        onClick={() => handleRegistrarAvance(meta)}
                      >
                        Sumar avance
                      </Button>
                    </div>
                  </MetaCard>
                ),
              )}
            </ul>
          )}
        </div>
      )}

      <Modal open={open} title="Nueva meta" onClose={() => setOpen(false)}>
        <form className="aula-form" onSubmit={handleSubmit} noValidate>
          {apiError && <Alert tone="error">{apiError}</Alert>}

          <SelectField
            label="Tipo de producto"
            value={form.tipo}
            onChange={(e) => update("tipo", e.target.value as MetaTipo)}
            options={TIPO_OPTIONS}
          />

          <TextField
            label="Cantidad objetivo"
            type="number"
            min={1}
            placeholder="10"
            value={form.cantidadObjetivo}
            onChange={(e) => update("cantidadObjetivo", e.target.value)}
            error={errors.cantidadObjetivo}
          />

          <TextField
            label="Descripción"
            placeholder="Detalle o alcance de la meta (opcional)."
            value={form.descripcion}
            onChange={(e) => update("descripcion", e.target.value)}
          />

          <div className="aula-form__actions">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear meta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
