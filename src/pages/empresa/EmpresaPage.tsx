import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { Alert } from "../../components/ui/Alert";
import { empresaService } from "../../services/empresaService";
import { useAuth } from "../../hooks/useAuth";
import type { Empresa, Supervisor } from "../../types";
import { isEmail, isRequired, errorMessage } from "../../utils/validators";
import "../practicas.css";

interface EmpresaForm {
  razonSocial: string;
  ruc: string;
  direccion: string;
  sector: string;
  telefono: string;
  email: string;
}
const EMPTY_EMPRESA: EmpresaForm = {
  razonSocial: "",
  ruc: "",
  direccion: "",
  sector: "",
  telefono: "",
  email: "",
};

interface SupervisorForm {
  nombres: string;
  apellidos: string;
  cargo: string;
  email: string;
  telefono: string;
}
const EMPTY_SUPERVISOR: SupervisorForm = {
  nombres: "",
  apellidos: "",
  cargo: "",
  email: "",
  telefono: "",
};

/** HU-13 · Registro de empresa / centro de prácticas + HU-19 · Supervisor externo. */
export function EmpresaPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);

  const [empresaForm, setEmpresaForm] = useState<EmpresaForm>(EMPTY_EMPRESA);
  const [empresaErrors, setEmpresaErrors] = useState<Partial<Record<keyof EmpresaForm, string>>>({});
  const [empresaApiError, setEmpresaApiError] = useState<string | null>(null);
  const [savingEmpresa, setSavingEmpresa] = useState(false);

  const [supForm, setSupForm] = useState<SupervisorForm>(EMPTY_SUPERVISOR);
  const [supErrors, setSupErrors] = useState<Partial<Record<keyof SupervisorForm, string>>>({});
  const [supApiError, setSupApiError] = useState<string | null>(null);
  const [savingSup, setSavingSup] = useState(false);

  useEffect(() => {
    if (!user) return;
    empresaService.getMine(user).then((e) => {
      setEmpresa(e);
      setLoading(false);
      if (e) empresaService.getSupervisor(e.id).then(setSupervisor);
    });
  }, [user]);

  if (!user) return null;

  function updateEmpresa<K extends keyof EmpresaForm>(key: K, value: string) {
    setEmpresaForm((prev) => ({ ...prev, [key]: value }));
  }
  function updateSup<K extends keyof SupervisorForm>(key: K, value: string) {
    setSupForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateEmpresa(): boolean {
    const next: typeof empresaErrors = {};
    if (!isRequired(empresaForm.razonSocial)) next.razonSocial = "Ingresa la razón social.";
    if (!isRequired(empresaForm.ruc)) next.ruc = "Ingresa el RUC.";
    if (!isRequired(empresaForm.direccion)) next.direccion = "Ingresa la dirección.";
    if (!isRequired(empresaForm.sector)) next.sector = "Ingresa el sector o rubro.";
    if (!isRequired(empresaForm.telefono)) next.telefono = "Ingresa un teléfono de contacto.";
    if (!isEmail(empresaForm.email)) next.email = "Ingresa un correo válido.";
    setEmpresaErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateSup(): boolean {
    const next: typeof supErrors = {};
    if (!isRequired(supForm.nombres)) next.nombres = "Ingresa los nombres.";
    if (!isRequired(supForm.apellidos)) next.apellidos = "Ingresa los apellidos.";
    if (!isRequired(supForm.cargo)) next.cargo = "Ingresa el cargo.";
    if (!isEmail(supForm.email)) next.email = "Ingresa un correo válido.";
    if (!isRequired(supForm.telefono)) next.telefono = "Ingresa un teléfono de contacto.";
    setSupErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleEmpresaSubmit(e: FormEvent) {
    e.preventDefault();
    setEmpresaApiError(null);
    if (!validateEmpresa() || !user) return;
    setSavingEmpresa(true);
    try {
      const created = await empresaService.register(empresaForm, user);
      setEmpresa(created);
    } catch (err) {
      setEmpresaApiError(errorMessage(err, "No se pudo registrar la empresa."));
    } finally {
      setSavingEmpresa(false);
    }
  }

  async function handleSupSubmit(e: FormEvent) {
    e.preventDefault();
    setSupApiError(null);
    if (!validateSup() || !empresa) return;
    setSavingSup(true);
    try {
      const created = await empresaService.registerSupervisor(empresa.id, supForm);
      setSupervisor(created);
    } catch (err) {
      setSupApiError(errorMessage(err, "No se pudo registrar el supervisor."));
    } finally {
      setSavingSup(false);
    }
  }

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Empresa y supervisor de prácticas</h1>
          <p className="pg__subtitle">
            Registra el centro de prácticas y el supervisor que te acompañará
            durante el proceso.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : empresa ? (
        <div className="card">
          <h2 className="card__title">Empresa registrada</h2>
          <dl className="kv">
            <dt>Razón social</dt>
            <dd>{empresa.razonSocial}</dd>
            <dt>RUC</dt>
            <dd>{empresa.ruc}</dd>
            <dt>Dirección</dt>
            <dd>{empresa.direccion}</dd>
            <dt>Sector</dt>
            <dd>{empresa.sector}</dd>
            <dt>Contacto</dt>
            <dd>
              {empresa.telefono} · {empresa.email}
            </dd>
          </dl>
        </div>
      ) : (
        <div className="card">
          <h2 className="card__title">Registrar empresa / centro de prácticas</h2>
          <form onSubmit={handleEmpresaSubmit} noValidate>
            {empresaApiError && <Alert tone="error">{empresaApiError}</Alert>}
            <div className="form-row">
              <TextField
                label="Razón social"
                placeholder="Radio Yaraví S.A.C."
                value={empresaForm.razonSocial}
                onChange={(e) => updateEmpresa("razonSocial", e.target.value)}
                error={empresaErrors.razonSocial}
              />
              <TextField
                label="RUC"
                placeholder="20123456789"
                value={empresaForm.ruc}
                onChange={(e) => updateEmpresa("ruc", e.target.value)}
                error={empresaErrors.ruc}
              />
            </div>
            <TextField
              label="Dirección"
              placeholder="Av. Ejército 710, Yanahuara, Arequipa"
              value={empresaForm.direccion}
              onChange={(e) => updateEmpresa("direccion", e.target.value)}
              error={empresaErrors.direccion}
            />
            <div className="form-row">
              <TextField
                label="Sector / rubro"
                placeholder="Medios de comunicación"
                value={empresaForm.sector}
                onChange={(e) => updateEmpresa("sector", e.target.value)}
                error={empresaErrors.sector}
              />
              <TextField
                label="Teléfono"
                placeholder="054-254321"
                value={empresaForm.telefono}
                onChange={(e) => updateEmpresa("telefono", e.target.value)}
                error={empresaErrors.telefono}
              />
            </div>
            <TextField
              label="Correo de contacto"
              placeholder="contacto@empresa.pe"
              value={empresaForm.email}
              onChange={(e) => updateEmpresa("email", e.target.value)}
              error={empresaErrors.email}
            />
            <div className="form-actions">
              <Button type="submit" loading={savingEmpresa}>
                Registrar empresa
              </Button>
            </div>
          </form>
        </div>
      )}

      {empresa && !loading && (
        <div className="card">
          <h2 className="card__title">Supervisor externo</h2>
          {supervisor ? (
            <dl className="kv">
              <dt>Nombre</dt>
              <dd>
                {supervisor.nombres} {supervisor.apellidos}
              </dd>
              <dt>Cargo</dt>
              <dd>{supervisor.cargo}</dd>
              <dt>Contacto</dt>
              <dd>
                {supervisor.email} · {supervisor.telefono}
              </dd>
            </dl>
          ) : (
            <form onSubmit={handleSupSubmit} noValidate>
              {supApiError && <Alert tone="error">{supApiError}</Alert>}
              <div className="form-row">
                <TextField
                  label="Nombres"
                  value={supForm.nombres}
                  onChange={(e) => updateSup("nombres", e.target.value)}
                  error={supErrors.nombres}
                />
                <TextField
                  label="Apellidos"
                  value={supForm.apellidos}
                  onChange={(e) => updateSup("apellidos", e.target.value)}
                  error={supErrors.apellidos}
                />
              </div>
              <TextField
                label="Cargo"
                placeholder="Jefe de Prensa"
                value={supForm.cargo}
                onChange={(e) => updateSup("cargo", e.target.value)}
                error={supErrors.cargo}
              />
              <div className="form-row">
                <TextField
                  label="Correo"
                  value={supForm.email}
                  onChange={(e) => updateSup("email", e.target.value)}
                  error={supErrors.email}
                />
                <TextField
                  label="Teléfono"
                  value={supForm.telefono}
                  onChange={(e) => updateSup("telefono", e.target.value)}
                  error={supErrors.telefono}
                />
              </div>
              <div className="form-actions">
                <Button type="submit" loading={savingSup}>
                  Registrar supervisor
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
