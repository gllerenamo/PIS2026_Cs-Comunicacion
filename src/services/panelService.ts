import type { Meta, Practica, Tarea, User } from "../types";
import { delay, rejectAfter } from "./apiClient";
import { db } from "./mockDb";

/** Duración típica de un ciclo de prácticas, usada para estimar el ritmo esperado de horas. */
const DURACION_ESPERADA_DIAS = 180;
/** Avance de meta por debajo de este umbral se considera riesgo. */
const META_RIESGO_UMBRAL = 0.3;

export interface AlumnoEnRiesgo {
  practicanteId: string;
  practicanteNombre: string;
  motivos: string[];
}

export interface ResumenProfesor {
  alumnosActivos: number;
  entregasPendientes: number;
  asistenciaPromedio: number | null;
  alumnosEnRiesgo: AlumnoEnRiesgo[];
}

export interface ResumenAdmin {
  alumnosMatriculados: number;
  profesoresActivos: number;
  aulasActivas: number;
  centrosDePracticas: number;
}

export interface ResumenEmpresa {
  practicantesActivos: number;
  horasPorValidar: number;
  evaluacionesPendientes: number;
  cumplimientoPromedio: number | null;
}

/** Motivos de riesgo de una práctica activa, según tareas vencidas, atraso de horas y avance de metas. */
function evaluarRiesgo(practica: Practica, tareas: Tarea[], metas: Meta[]): string[] {
  const motivos: string[] = [];
  const ahora = Date.now();

  const vencidas = tareas.filter(
    (t) =>
      t.practicanteId === practica.practicanteId &&
      !t.completada &&
      new Date(t.fechaVencimiento).getTime() < ahora,
  );
  if (vencidas.length > 0) {
    motivos.push(`${vencidas.length} tarea(s) vencida(s)`);
  }

  const diasTranscurridos = (ahora - new Date(practica.fechaInicio).getTime()) / 86400000;
  const progresoEsperado = Math.min(1, diasTranscurridos / DURACION_ESPERADA_DIAS);
  const progresoReal = practica.horasAcumuladas / practica.horasMinimas;
  if (progresoEsperado > 0.3 && progresoReal < progresoEsperado * 0.6) {
    motivos.push("Atrasado en horas acumuladas");
  }

  const metasBajas = metas.filter(
    (m) => m.practicaId === practica.id && m.cantidadAlcanzada / m.cantidadObjetivo < META_RIESGO_UMBRAL,
  );
  if (metasBajas.length > 0) {
    motivos.push(`${metasBajas.length} meta(s) con avance bajo`);
  }

  return motivos;
}

/**
 * Agregados de estadísticas para los paneles de control por rol:
 * profesor (HU-22), administrador (HU-23) y supervisor externo (HU-24).
 */
export const panelService = {
  async getResumenProfesor(user: User): Promise<ResumenProfesor> {
    const practicas = db.getPracticasByDocente(user.id);
    const tareas = db.getTareasByDocente(user.id);
    const asistencias = db.getAsistenciasByDocente(user.id);
    const practicaIds = practicas.map((p) => p.id);
    const metas = db.getMetas().filter((m) => practicaIds.includes(m.practicaId));

    const activas = practicas.filter((p) => p.estado !== "CERRADA");
    const alumnosActivos = new Set(activas.map((p) => p.practicanteId)).size;
    const entregasPendientes = tareas.filter((t) => !t.completada).length;

    const asistenciaPromedio =
      asistencias.length === 0
        ? null
        : Math.round(
            (asistencias.filter((a) => a.presente).length / asistencias.length) * 100,
          );

    const alumnosEnRiesgo: AlumnoEnRiesgo[] = activas
      .map((p) => ({
        practicanteId: p.practicanteId,
        practicanteNombre: p.practicanteNombre,
        motivos: evaluarRiesgo(p, tareas, metas),
      }))
      .filter((r) => r.motivos.length > 0);

    return delay({ alumnosActivos, entregasPendientes, asistenciaPromedio, alumnosEnRiesgo });
  },

  async getResumenAdmin(_user: User): Promise<ResumenAdmin> {
    const usuarios = db.getUsers();
    const aulas = db.getAulas();
    const empresas = db.getEmpresas();

    const alumnosMatriculados = usuarios.filter((u) => u.role === "ALUMNO").length;
    const profesoresActivos = usuarios.filter(
      (u) => u.role === "PROFESOR" && db.getAulasByProfesor(u.id).some((a) => a.estado === "ACTIVA"),
    ).length;
    const aulasActivas = aulas.filter((a) => a.estado === "ACTIVA").length;
    // Empresa hoy es 1:1 por alumno (no un catálogo normalizado de centros);
    // se cuenta por RUC distinto para no duplicar el mismo centro.
    const centrosDePracticas = new Set(empresas.map((e) => e.ruc)).size;

    return delay({ alumnosMatriculados, profesoresActivos, aulasActivas, centrosDePracticas });
  },

  async getResumenEmpresa(user: User): Promise<ResumenEmpresa> {
    if (user.role !== "SUPERVISOR") {
      return rejectAfter(403, "Solo un supervisor externo puede ver este panel.");
    }

    const empresaIds = db.getEmpresasBySupervisor(user.id).map((e) => e.id);
    const practicas = db.getPracticasByEmpresas(empresaIds);
    const horas = db.getRegistrosHorasPorEmpresas(empresaIds);
    const evaluaciones = db.getEvaluacionesByEmpresas(empresaIds);

    const activas = practicas.filter((p) => p.estado !== "CERRADA");
    const practicantesActivos = new Set(activas.map((p) => p.practicanteId)).size;
    const horasPorValidar = horas.filter((h) => h.estadoValidacion === "PENDIENTE").length;
    const evaluacionesPendientes = evaluaciones.filter((e) => e.estado === "PENDIENTE").length;

    const cumplimientoPromedio =
      practicas.length === 0
        ? null
        : Math.round(
            (practicas.reduce(
              (acc, p) => acc + Math.min(1, p.horasAcumuladas / p.horasMinimas),
              0,
            ) /
              practicas.length) *
              100,
          );

    return delay({ practicantesActivos, horasPorValidar, evaluacionesPendientes, cumplimientoPromedio });
  },
};
