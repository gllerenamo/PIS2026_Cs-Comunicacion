"""
Experiencia del alumno (HU-05): vista de clases programadas y actividad reciente.
Rutas: /api/v1/alumno/*
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.models import ActividadReciente, Inscripcion, User
from app.schemas.schemas import ActividadRecienteOut, AulaAlumnoOut

router = APIRouter(prefix="/alumno", tags=["alumno"])


def _solo_alumno(user: User) -> None:
    if user.role.value != "ALUMNO":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los alumnos pueden acceder a esta sección.",
        )


# ── GET /api/v1/alumno/mis-aulas ─────────────────────────────────────────────


@router.get("/mis-aulas", response_model=list[AulaAlumnoOut])
def list_mis_aulas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lista las aulas en las que el alumno está inscrito, con su avance.
    Equivale al mock: alumnoService.listMisAulas()
    """
    _solo_alumno(current_user)

    inscripciones = (
        db.query(Inscripcion)
        .filter(Inscripcion.alumno_id == current_user.id)
        .all()
    )

    salida: list[AulaAlumnoOut] = []
    for ins in inscripciones:
        aula = ins.aula
        salida.append(
            AulaAlumnoOut(
                id=aula.id,
                nombre=aula.nombre,
                profesorNombre=f"{aula.profesor.nombres} {aula.profesor.apellidos}",
                ciclo=aula.periodo,
                estado=aula.estado.value,
                progreso=ins.progreso,
                semanaActual=ins.semana_actual,
                semanasTotales=ins.semanas_totales,
            )
        )
    # Activas primero, luego concluidas.
    salida.sort(key=lambda a: 0 if a.estado == "ACTIVA" else 1)
    return salida


# ── GET /api/v1/alumno/actividad ─────────────────────────────────────────────


@router.get("/actividad", response_model=list[ActividadRecienteOut])
def list_actividad(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Feed de actividad reciente del alumno.
    Equivale al mock: alumnoService.listActividadReciente()
    """
    _solo_alumno(current_user)

    items = (
        db.query(ActividadReciente)
        .filter(ActividadReciente.alumno_id == current_user.id)
        .order_by(ActividadReciente.created_at.desc())
        .all()
    )
    return [
        ActividadRecienteOut(
            id=it.id,
            titulo=it.titulo,
            contexto=it.contexto,
            tiempo=it.tiempo,
            estado=it.estado.value,
        )
        for it in items
    ]
