import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { ReporteInstitucional } from "../../types";
import "../profesor/docencia.css";

const fmt = (n: number | null) => (n == null ? "—" : String(n));

function descargarCSV(nombre: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** HU-32 · Reportes y análisis institucionales (admin). */
export function ReportesPage() {
  const [rep, setRep] = useState<ReporteInstitucional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getReportes()
      .then(setRep)
      .catch(() => setError("No se pudieron cargar los reportes."))
      .finally(() => setLoading(false));
  }, []);

  function exportar() {
    if (!rep) return;
    const cab = ["Aula", "Periodo", "Profesor", "Estado", "Inscritos", "Promedio", "Asistencia %"];
    const filas = rep.aulas.map((a) => [
      a.aulaNombre,
      a.periodo,
      a.profesorNombre,
      a.estado,
      String(a.inscritos),
      fmt(a.promedioNotas),
      a.asistenciaPct == null ? "—" : String(a.asistenciaPct),
    ]);
    const csv = [cab, ...filas]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    descargarCSV("reporte_institucional.csv", csv);
  }

  if (loading) return <p className="doc-muted">Cargando reportes…</p>;
  if (error) return <p className="doc-error">{error}</p>;
  if (!rep) return null;

  const kpis = [
    { lbl: "Alumnos", val: rep.totalAlumnos },
    { lbl: "Profesores", val: rep.totalProfesores },
    { lbl: "Aulas activas", val: `${rep.aulasActivas}/${rep.totalAulas}` },
    { lbl: "Prácticas en curso", val: rep.practicasEnCurso },
    { lbl: "Prácticas cerradas", val: rep.practicasCerradas },
    { lbl: "Horas promedio", val: fmt(rep.horasPromedio) },
  ];

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Panel › Análisis › Reportes</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Reportes y análisis</h1>
          <p className="doc__subtitle">Indicadores del programa de prácticas por aula</p>
        </div>
        <button className="doc-btn doc-btn--ghost" onClick={exportar}>
          Exportar CSV
        </button>
      </header>

      <div className="doc-kpis">
        {kpis.map((k) => (
          <div key={k.lbl} className="doc-kpi">
            <div className="doc-kpi__lbl">{k.lbl}</div>
            <div className="doc-kpi__val">{k.val}</div>
          </div>
        ))}
      </div>

      <div className="doc-tablewrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Aula</th>
              <th>Periodo</th>
              <th>Profesor</th>
              <th className="doc-table__num">Estado</th>
              <th className="doc-table__num">Inscritos</th>
              <th className="doc-table__num">Promedio</th>
              <th className="doc-table__num">Asistencia</th>
            </tr>
          </thead>
          <tbody>
            {rep.aulas.map((a) => (
              <tr key={a.aulaId}>
                <td>{a.aulaNombre}</td>
                <td>{a.periodo}</td>
                <td>{a.profesorNombre}</td>
                <td className="doc-table__num">
                  <span
                    className={`doc-chip ${a.estado === "ACTIVA" ? "doc-chip--ok" : "doc-chip--warn"}`}
                  >
                    {a.estado === "ACTIVA" ? "Activa" : "Concluida"}
                  </span>
                </td>
                <td className="doc-table__num">{a.inscritos}</td>
                <td className="doc-table__num">{fmt(a.promedioNotas)}</td>
                <td className="doc-table__num">
                  {a.asistenciaPct == null ? "—" : `${a.asistenciaPct}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
