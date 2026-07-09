import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { SelectField } from "../../components/ui/SelectField";
import { Alert } from "../../components/ui/Alert";
import { practicaService } from "../../services/practicaService";
import { reporteService } from "../../services/reporteService";
import { useAuth } from "../../hooks/useAuth";
import type { Practica, ReporteFinal } from "../../types";
import { errorMessage } from "../../utils/validators";
import "../practicas.css";

/** HU-16 · Generación de reporte final consolidado de prácticas. */
export function ReportePage() {
  const { user } = useAuth();
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [reporte, setReporte] = useState<ReporteFinal | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    practicaService.list(user).then((list) => {
      setPracticas(list);
      setSelectedId(list[0]?.id ?? "");
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  async function handleGenerar() {
    if (!user || !selectedId) return;
    setApiError(null);
    setGenerating(true);
    setReporte(null);
    try {
      const r = await reporteService.generar(selectedId, user);
      setReporte(r);
    } catch (err) {
      setApiError(errorMessage(err, "No se pudo generar el reporte."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopiar() {
    if (!reporte) return;
    try {
      await navigator.clipboard.writeText(reporte.contenido);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* portapapeles no disponible; se ignora silenciosamente */
    }
  }

  return (
    <div>
      <header className="pg__header">
        <div>
          <h1 className="pg__title">Reporte final de prácticas</h1>
          <p className="pg__subtitle">
            Consolida la información del proceso para presentarla ante la
            Escuela de Ciencias de la Comunicación.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="pg__subtitle">Cargando…</p>
      ) : practicas.length === 0 ? (
        <div className="empty">
          <p>No hay prácticas disponibles para generar un reporte.</p>
        </div>
      ) : (
        <div className="card">
          <div className="select-bar">
            <SelectField
              label="Selecciona la práctica"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              options={practicas.map((p) => ({
                value: p.id,
                label: `${p.practicanteNombre} · ${p.aulaNombre} (${p.periodo})`,
              }))}
            />
            <Button onClick={handleGenerar} loading={generating}>
              Generar reporte
            </Button>
          </div>

          {apiError && <Alert tone="error">{apiError}</Alert>}

          {reporte && (
            <>
              <div className="report">{reporte.contenido}</div>
              <div className="form-actions">
                <Button variant="secondary" onClick={handleCopiar}>
                  {copied ? "Copiado ✓" : "Copiar reporte"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
