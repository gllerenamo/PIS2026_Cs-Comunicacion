"""
Vistas del profesor/asesor (HU-11): progreso de practicantes.
Panel de control del profesor (HU-22): alumnos activos, entregas pendientes,
asistencia promedio y alumnos en riesgo.
Rutas: /api/v1/profesor/*
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.models import (
    Aula,
    Entrega,
    Inscripcion,
    Meta,
    MetaTipoEnum,
    Practica,
    PracticaEstadoEnum,
    RegistroAsistencia,
    Tarea,
    User,
)
from app.schemas.schemas import AlumnoEnRiesgoOut, PracticanteProgresoOut, ResumenProfesorOut

router = APIRouter(prefix="/profesor", tags=["profesor"])

# Duración típica de un ciclo de prácticas (días), usada para estimar el ritmo
# esperado de horas. Supuesto ajustable, documentado explícitamente.
DURACION_ESPERADA_DIAS = 180
# Avance de meta por debajo de este umbral se considera riesgo.
META_RIESGO_UMBRAL = 0.3


def _solo_profesor_o_admin(user: User) -> None:
    if user.role.value not in ("PROFESOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="Acceso restringido.")


# ── GET /api/v1/profesor/practicantes ─────────────────────────────────────────


@router.get("/practicantes", response_model=list[PracticanteProgresoOut])
def list_practicantes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lista todos los practicantes inscritos en las aulas del profesor,
    con su avance, semanas y estado de entrega de tareas.
    El rol ADMIN ve todas las aulas.
    """
    _solo_profesor_o_admin(current_user)

    if current_user.role.value == "ADMIN":
        aulas = db.query(Aula).all()
    else:
        aulas = db.query(Aula).filter(Aula.profesor_id == current_user.id).all()

    aula_map = {a.id: a for a in aulas}
    aula_ids = list(aula_map.keys())

    inscripciones = (
        db.query(Inscripcion)
        .filter(Inscripcion.aula_id.in_(aula_ids))
        .all()
    )

    resultado: list[PracticanteProgresoOut] = []
    for ins in inscripciones:
        aula = aula_map[ins.aula_id]
        alumno: User = ins.alumno

        tareas = db.query(Tarea).filter(Tarea.aula_id == ins.aula_id).all()
        tareas_total = len(tareas)
        tareas_entregadas = 0
        if tareas_total > 0:
            tareas_entregadas = (
                db.query(Entrega)
                .filter(
                    Entrega.alumno_id == ins.alumno_id,
                    Entrega.tarea_id.in_([t.id for t in tareas]),
                )
                .count()
            )

        resultado.append(
            PracticanteProgresoOut(
                alumnoId=alumno.id,
                alumnoNombre=f"{alumno.nombres} {alumno.apellidos}",
                alumnoEmail=alumno.email,
                aulaId=aula.id,
                aulaNombre=aula.nombre,
                progreso=ins.progreso,
                semanaActual=ins.semana_actual,
                semanasTotales=ins.semanas_totales,
                estado=aula.estado.value,
                tareasEntregadas=tareas_entregadas,
                tareasTotal=tareas_total,
            )
        )

    resultado.sort(key=lambda x: (x.aulaNombre, x.alumnoNombre))
    return resultado


def _tareas_vencidas_sin_entregar(
    tareas_aula: list[Tarea], entregadas_ids: set[str], ahora: datetime
) -> int:
    vencidas = [t for t in tareas_aula if t.fecha_limite and t.fecha_limite < ahora]
    return len([t for t in vencidas if t.id not in entregadas_ids])


def _evaluar_riesgo(
    practica: Practica,
    tareas_por_aula: dict[str, list[Tarea]],
    entregas_por_alumno: dict[str, set[str]],
    metas_por_practica: dict[str, list[Meta]],
    ahora: datetime,
) -> list[str]:
    motivos: list[str] = []

    tareas_aula = tareas_por_aula.get(practica.aula_id, [])
    entregadas = entregas_por_alumno.get(practica.practicante_id, set())
    n_vencidas = _tareas_vencidas_sin_entregar(tareas_aula, entregadas, ahora)
    if n_vencidas > 0:
        motivos.append(f"{n_vencidas} tarea(s) vencida(s)")

    dias_transcurridos = (
        (ahora - practica.fecha_inicio).days if practica.fecha_inicio else 0
    )
    progreso_esperado = min(1, dias_transcurridos / DURACION_ESPERADA_DIAS)
    progreso_real = (
        practica.horas_acumuladas / practica.horas_minimas if practica.horas_minimas else 0
    )
    if progreso_esperado > 0.3 and progreso_real < progreso_esperado * 0.6:
        motivos.append("Atrasado en horas acumuladas")

    metas_bajas = 0
    for m in metas_por_practica.get(practica.id, []):
        alcanzada = (
            practica.horas_acumuladas if m.tipo == MetaTipoEnum.HORAS else m.cantidad_alcanzada
        )
        if m.cantidad_objetivo and alcanzada / m.cantidad_objetivo < META_RIESGO_UMBRAL:
            metas_bajas += 1
    if metas_bajas > 0:
        motivos.append(f"{metas_bajas} meta(s) con avance bajo")

    return motivos


# ── GET /api/v1/profesor/resumen ──────────────────────────────────────────────


@router.get("/resumen", response_model=ResumenProfesorOut)
def resumen_profesor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Panel de control del profesor (HU-22)."""
    _solo_profesor_o_admin(current_user)

    if current_user.role.value == "ADMIN":
        aulas = db.query(Aula).all()
    else:
        aulas = db.query(Aula).filter(Aula.profesor_id == current_user.id).all()
    aula_ids = [a.id for a in aulas]

    practicas = (
        db.query(Practica).filter(Practica.aula_id.in_(aula_ids)).all() if aula_ids else []
    )
    activas = [p for p in practicas if p.estado != PracticaEstadoEnum.CERRADA]
    alumnos_activos = len({p.practicante_id for p in activas})

    inscripciones = (
        db.query(Inscripcion).filter(Inscripcion.aula_id.in_(aula_ids)).all()
        if aula_ids
        else []
    )
    tareas = db.query(Tarea).filter(Tarea.aula_id.in_(aula_ids)).all() if aula_ids else []
    tareas_por_aula: dict[str, list[Tarea]] = {}
    for t in tareas:
        tareas_por_aula.setdefault(t.aula_id, []).append(t)

    tarea_ids = [t.id for t in tareas]
    entregas_por_alumno: dict[str, set[str]] = {}
    if tarea_ids:
        for e in db.query(Entrega).filter(Entrega.tarea_id.in_(tarea_ids)):
            entregas_por_alumno.setdefault(e.alumno_id, set()).add(e.tarea_id)

    ahora = datetime.now(timezone.utc)
    entregas_pendientes = 0
    for ins in inscripciones:
        tareas_aula = tareas_por_aula.get(ins.aula_id, [])
        entregadas = entregas_por_alumno.get(ins.alumno_id, set())
        entregas_pendientes += len([t for t in tareas_aula if t.id not in entregadas])

    asistencias = (
        db.query(RegistroAsistencia).filter(RegistroAsistencia.aula_id.in_(aula_ids)).all()
        if aula_ids
        else []
    )
    asistencia_promedio = None
    if asistencias:
        presentes = len([a for a in asistencias if a.presente])
        asistencia_promedio = round(presentes / len(asistencias) * 100)

    practica_ids = [p.id for p in practicas]
    metas_por_practica: dict[str, list[Meta]] = {}
    if practica_ids:
        for m in db.query(Meta).filter(Meta.practica_id.in_(practica_ids)):
            metas_por_practica.setdefault(m.practica_id, []).append(m)

    en_riesgo: list[AlumnoEnRiesgoOut] = []
    for p in activas:
        motivos = _evaluar_riesgo(p, tareas_por_aula, entregas_por_alumno, metas_por_practica, ahora)
        if motivos:
            en_riesgo.append(
                AlumnoEnRiesgoOut(
                    practicanteId=p.practicante_id,
                    practicanteNombre=f"{p.practicante.nombres} {p.practicante.apellidos}",
                    motivos=motivos,
                )
            )

    return ResumenProfesorOut(
        alumnosActivos=alumnos_activos,
        entregasPendientes=entregas_pendientes,
        asistenciaPromedio=asistencia_promedio,
        alumnosEnRiesgo=en_riesgo,
    )
