import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { Modal } from "../../components/ui/Modal";
import { Alert } from "../../components/ui/Alert";
import { aulaService } from "../../services/aulaService";
import { useAuth } from "../../hooks/useAuth";
import type { Aula } from "../../types";
import { isRequired, errorMessage } from "../../utils/validators";
import "./AulasPage.css";

interface NewAula {
  nombre: string;
  codigo: string;
  periodo: string;
  descripcion: string;
}

const EMPTY: NewAula = { nombre: "", codigo: "", periodo: "", descripcion: "" };

/** HU-4 · Creación y gestión de clases/prácticas. */
export function AulasPage() {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewAula>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof NewAula, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    aulaService
      .list(user)
      .then(setAulas)
      .finally(() => setLoadingList(false));
  }, [user]);

  if (!user) return null;

  function update<K extends keyof NewAula>(key: K, value: NewAula[K]) {
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
    if (!isRequired(form.nombre)) next.nombre = "Ingresa el nombre de la clase.";
    if (!isRequired(form.codigo)) next.codigo = "Ingresa un código.";
    if (!isRequired(form.periodo)) next.periodo = "Ingresa el periodo (ej. 2026-I).";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate() || !user) return;

    setSaving(true);
    try {
      const created = await aulaService.create(form, user);
      setAulas((prev) => [created, ...prev]);
      setOpen(false);
    } catch (err) {
      setApiError(errorMessage(err, "No se pudo crear la clase."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="aulas">
      <header className="aulas__header">
        <div>
          <h1 className="aulas__title">Clases y prácticas</h1>
          <p className="aulas__subtitle">
            Administra las aulas de prácticas pre-profesionales.
          </p>
        </div>
        <Button onClick={openModal}>+ Nueva clase</Button>
      </header>

      {loadingList ? (
        <p className="aulas__empty">Cargando clases…</p>
      ) : aulas.length === 0 ? (
        <div className="aulas__empty">
          <p>Aún no has creado ninguna clase.</p>
          <Button variant="secondary" onClick={openModal}>
            Crear la primera clase
          </Button>
        </div>
      ) : (
        <div className="aulas__grid">
          {aulas.map((aula) => (
            <article key={aula.id} className="aula-card">
              <div className="aula-card__top">
                <span className="aula-card__code">{aula.codigo}</span>
                <span
                  className={`aula-card__badge aula-card__badge--${aula.estado.toLowerCase()}`}
                >
                  {aula.estado === "ACTIVA" ? "Activa" : "Concluida"}
                </span>
              </div>
              <h3 className="aula-card__name">{aula.nombre}</h3>
              <p className="aula-card__desc">{aula.descripcion || "Sin descripción."}</p>
              <footer className="aula-card__foot">
                <span>{aula.periodo}</span>
                <span>{aula.inscritos} inscritos</span>
              </footer>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} title="Nueva clase / práctica" onClose={() => setOpen(false)}>
        <form className="aula-form" onSubmit={handleSubmit} noValidate>
          {apiError && <Alert tone="error">{apiError}</Alert>}

          <TextField
            label="Nombre de la clase"
            placeholder="Prácticas Pre-Profesionales I"
            value={form.nombre}
            onChange={(e) => update("nombre", e.target.value)}
            error={errors.nombre}
          />

          <div className="aula-form__row">
            <TextField
              label="Código"
              placeholder="PP-2026-I"
              value={form.codigo}
              onChange={(e) => update("codigo", e.target.value)}
              error={errors.codigo}
            />
            <TextField
              label="Periodo"
              placeholder="2026-I"
              value={form.periodo}
              onChange={(e) => update("periodo", e.target.value)}
              error={errors.periodo}
            />
          </div>

          <TextField
            label="Descripción"
            placeholder="Objetivo y alcance de la práctica (opcional)."
            value={form.descripcion}
            onChange={(e) => update("descripcion", e.target.value)}
          />

          <div className="aula-form__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear clase
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
