import { useCallback, useEffect, useState } from "react";
import { AulaSelect } from "../../components/profesor/AulaSelect";
import { profesorService } from "../../services/profesorService";
import type { LibroCalificaciones } from "../../types";
import "./docencia.css";

const fmt = (n: number | null) => (n == null ? "—" : String(n));

/** Descarga un texto como archivo local (CSV). */
function descargar(nombre: string, contenido: string) {
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** HU-27 · Libro de calificaciones consolidado del aula. */
export function LibroPage() {
  const [aulaId, setAulaId] = useState("");
  const [libro, setLibro] = useState<LibroCalificaciones | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    if (!aulaId) return;
    setLoading(true);
    setError("");
    profesorService
      .getLibro(aulaId)
      .then(setLibro)
      .catch(() => setError("No se pudo cargar el libro de calificaciones."))
      .finally(() => setLoading(false));
  }, [aulaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function exportarCSV() {
    if (!libro) return;
    const cab = [
      "Practicante",
      ...libro.tareas.map((t) => t.titulo),
      "Asistencia %",
      "Horas",
      "Promedio",
    ];
    const filas = libro.alumnos.map((a) => [
      a.alumnoNombre,
      ...libro.tareas.map((t) => fmt(a.notas[t.id] ?? null)),
      a.asistenciaPct == null ? "—" : `${a.asistenciaPct}`,
      String(a.horas),
      fmt(a.promedio),
    ]);
    const csv = [cab, ...filas]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    descargar(`libro_${libro.aulaNombre.replace(/\s+/g, "_")}.csv`, csv);
  }

  return (
    <div className="doc">
      <p className="doc__breadcrumb">Inicio › Docencia › Calificaciones</p>
      <header className="doc__head">
        <div>
          <h1 className="doc__title">Libro de calificaciones</h1>
          <p className="doc__subtitle">
            {libro
              ? `${libro.alumnos.length} practicantes · Promedio general ${fmt(libro.promedioGeneral)} / 20`
              : "Notas por tarea, asistencia y horas acumuladas"}
          </p>
        </div>
        <button className="doc-btn doc-btn--ghost" onClick={exportarCSV} disabled={!libro}>
          Exportar CSV
        </button>
      </header>

      <div className="doc__toolbar">
        <AulaSelect value={aulaId} onChange={(id) => setAulaId(id)} />
      </div>

      {error && <p className="doc-error">{error}</p>}
      {loading ? (
        <p className="doc-muted">Cargando libro…</p>
      ) : libro && libro.alumnos.length > 0 ? (
        <div className="doc-tablewrap">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Practicante</th>
                {libro.tareas.map((t) => (
                  <th key={t.id} className="doc-table__num">
                    {t.titulo}
                  </th>
                ))}
                <th className="doc-table__num">Asist.</th>
                <th className="doc-table__num">Horas</th>
                <th style={{ textAlign: "right" }}>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {libro.alumnos.map((a) => (
                <tr key={a.alumnoId}>
                  <td>{a.alumnoNombre}</td>
                  {libro.tareas.map((t) => (
                    <td key={t.id} className="doc-table__num">
                      {fmt(a.notas[t.id] ?? null)}
                    </td>
                  ))}
                  <td className="doc-table__num">
                    {a.asistenciaPct == null ? "—" : `${a.asistenciaPct}%`}
                  </td>
                  <td className="doc-table__num">{a.horas} h</td>
                  <td className="doc-table__avg">{fmt(a.promedio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="doc-muted">No hay practicantes en esta aula.</p>
      )}
    </div>
  );
}
