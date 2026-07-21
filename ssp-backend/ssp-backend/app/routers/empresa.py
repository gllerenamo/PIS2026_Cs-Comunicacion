"""
Registro de empresa/centro de prácticas (HU-13) y su supervisor externo (HU-19).
Solo el propio practicante gestiona sus datos.
Rutas: /api/v1/empresa/*
"""

import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.models import (
    DocumentoCentro,
    Empresa,
    Evaluacion,
    EvaluacionEstadoEnum,
    Practica,
    PracticaEstadoEnum,
    RegistroHoras,
    RegistroHorasEstadoEnum,
    Supervisor,
    User,
)
from app.schemas.schemas import (
    CentroOut,
    CompletarEvaluacionRequest,
    CreateEmpresaRequest,
    CreateSupervisorRequest,
    DocumentoCentroOut,
    EmpresaOut,
    EvaluacionDetalleOut,
    PracticanteCentroOut,
    RegistroValidacionOut,
    ResumenEmpresaOut,
    SupervisorOut,
    UpdateCentroRequest,
    UpdateContactoSupervisorRequest,
    ValidarHorasRequest,
)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
UPLOAD_BASE = Path(settings.UPLOAD_DIR).resolve()

router = APIRouter(prefix="/empresa", tags=["empresa"])


def _solo_supervisor(user: User) -> None:
    if user.role.value != "SUPERVISOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un supervisor externo puede acceder.",
        )


def _empresa_ids_del_centro(db: Session, user: User) -> list[str]:
    """
    Ids de las empresas que supervisa el usuario.

    Cada practicante registra su propio centro de prácticas, por lo que un mismo
    centro aparece como varias filas de `empresas` con el mismo RUC. El supervisor
    supervisa a todos los practicantes de su centro, así que agrupamos por RUC.
    """
    propias = db.query(Supervisor).filter(Supervisor.user_id == user.id).all()
    if not propias:
        return []
    rucs = {
        e.ruc
        for e in db.query(Empresa).filter(
            Empresa.id.in_([s.empresa_id for s in propias])
        )
    }
    if not rucs:
        return []
    return [e.id for e in db.query(Empresa).filter(Empresa.ruc.in_(rucs))]


def _practicas_del_centro(db: Session, user: User) -> list[Practica]:
    ids = _empresa_ids_del_centro(db, user)
    if not ids:
        return []
    return db.query(Practica).filter(Practica.empresa_id.in_(ids)).all()


def _recalcular_horas(db: Session, practica: Practica) -> None:
    """
    Recalcula las horas acumuladas contando solo los registros no rechazados.
    Es idempotente: evita descuadres al validar o rechazar varias veces.
    """
    registros = (
        db.query(RegistroHoras).filter(RegistroHoras.practica_id == practica.id).all()
    )
    practica.horas_acumuladas = sum(
        r.horas
        for r in registros
        if r.estado_validacion != RegistroHorasEstadoEnum.RECHAZADO
    )
    if practica.estado != PracticaEstadoEnum.CERRADA:
        practica.estado = (
            PracticaEstadoEnum.LISTA_PARA_CIERRE
            if practica.horas_acumuladas >= practica.horas_minimas
            else PracticaEstadoEnum.EN_CURSO
        )


def _to_empresa_out(e: Empresa) -> EmpresaOut:
    return EmpresaOut(
        id=e.id,
        practicanteId=e.practicante_id,
        razonSocial=e.razon_social,
        ruc=e.ruc,
        direccion=e.direccion,
        sector=e.sector,
        telefono=e.telefono,
        email=e.email,
        fechaRegistro=e.created_at.isoformat() if e.created_at else "",
    )


def _to_supervisor_out(s: Supervisor) -> SupervisorOut:
    return SupervisorOut(
        id=s.id,
        empresaId=s.empresa_id,
        userId=s.user_id,
        nombres=s.nombres,
        apellidos=s.apellidos,
        cargo=s.cargo,
        email=s.email,
        telefono=s.telefono,
    )


# ── GET /api/v1/empresa/mine ──────────────────────────────────────────────────


@router.get("/mine", response_model=Optional[EmpresaOut])
def get_mine(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Empresa registrada por el practicante autenticado, o null si no existe."""
    empresa = (
        db.query(Empresa).filter(Empresa.practicante_id == current_user.id).first()
    )
    return _to_empresa_out(empresa) if empresa else None


# ── GET /api/v1/empresa/{empresa_id}/supervisor ───────────────────────────────


@router.get("/{empresa_id}/supervisor", response_model=Optional[SupervisorOut])
def get_supervisor(
    empresa_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supervisor registrado para la empresa indicada, o null si no existe."""
    supervisor = (
        db.query(Supervisor).filter(Supervisor.empresa_id == empresa_id).first()
    )
    return _to_supervisor_out(supervisor) if supervisor else None


# ── POST /api/v1/empresa ──────────────────────────────────────────────────────


@router.post("", response_model=EmpresaOut, status_code=status.HTTP_201_CREATED)
def register_empresa(
    payload: CreateEmpresaRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Registra la empresa/centro de prácticas del practicante (HU-13)."""
    if current_user.role.value != "ALUMNO":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el practicante puede registrar su empresa.",
        )
    existe = (
        db.query(Empresa).filter(Empresa.practicante_id == current_user.id).first()
    )
    if existe is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya registraste una empresa para tus prácticas.",
        )

    empresa = Empresa(
        practicante_id=current_user.id,
        razon_social=payload.razonSocial,
        ruc=payload.ruc,
        direccion=payload.direccion,
        sector=payload.sector,
        telefono=payload.telefono,
        email=payload.email,
    )
    db.add(empresa)
    db.commit()
    db.refresh(empresa)
    return _to_empresa_out(empresa)


# ── POST /api/v1/empresa/{empresa_id}/supervisor ──────────────────────────────


@router.post(
    "/{empresa_id}/supervisor",
    response_model=SupervisorOut,
    status_code=status.HTTP_201_CREATED,
)
def register_supervisor(
    empresa_id: str,
    payload: CreateSupervisorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Registra al supervisor externo asignado en la empresa (HU-19)."""
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if empresa is None:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")
    if empresa.practicante_id != current_user.id and current_user.role.value == "ALUMNO":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el practicante dueño puede registrar el supervisor.",
        )
    if db.query(Supervisor).filter(Supervisor.empresa_id == empresa_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un supervisor registrado para esta empresa.",
        )

    supervisor = Supervisor(
        empresa_id=empresa_id,
        nombres=payload.nombres,
        apellidos=payload.apellidos,
        cargo=payload.cargo,
        email=payload.email,
        telefono=payload.telefono,
    )
    db.add(supervisor)
    db.commit()
    db.refresh(supervisor)
    return _to_supervisor_out(supervisor)


# ── GET /api/v1/empresa/resumen ───────────────────────────────────────────────


@router.get("/resumen", response_model=ResumenEmpresaOut)
def resumen_empresa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Panel de control de empresa (HU-24): solo el supervisor externo."""
    _solo_supervisor(current_user)

    empresa_ids = _empresa_ids_del_centro(db, current_user)
    practicas = _practicas_del_centro(db, current_user)
    activas = [p for p in practicas if p.estado != PracticaEstadoEnum.CERRADA]
    practicantes_activos = len({p.practicante_id for p in activas})

    practica_ids = [p.id for p in practicas]
    horas = (
        db.query(RegistroHoras).filter(RegistroHoras.practica_id.in_(practica_ids)).all()
        if practica_ids
        else []
    )
    horas_por_validar = len(
        [h for h in horas if h.estado_validacion == RegistroHorasEstadoEnum.PENDIENTE]
    )

    evaluaciones = (
        db.query(Evaluacion).filter(Evaluacion.empresa_id.in_(empresa_ids)).all()
        if empresa_ids
        else []
    )
    evaluaciones_pendientes = len(
        [e for e in evaluaciones if e.estado == EvaluacionEstadoEnum.PENDIENTE]
    )

    cumplimiento_promedio = None
    if practicas:
        promedio = sum(
            min(1, p.horas_acumuladas / p.horas_minimas) for p in practicas if p.horas_minimas
        ) / len(practicas)
        cumplimiento_promedio = round(promedio * 100)

    return ResumenEmpresaOut(
        practicantesActivos=practicantes_activos,
        horasPorValidar=horas_por_validar,
        evaluacionesPendientes=evaluaciones_pendientes,
        cumplimientoPromedio=cumplimiento_promedio,
    )


# ── HU-39 · Practicantes del centro ───────────────────────────────────────────


@router.get("/practicantes", response_model=list[PracticanteCentroOut])
def list_practicantes_centro(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Practicantes asignados al centro de prácticas del supervisor."""
    _solo_supervisor(current_user)
    practicas = _practicas_del_centro(db, current_user)

    out: list[PracticanteCentroOut] = []
    for p in practicas:
        pendientes = (
            db.query(RegistroHoras)
            .filter(
                RegistroHoras.practica_id == p.id,
                RegistroHoras.estado_validacion == RegistroHorasEstadoEnum.PENDIENTE,
            )
            .count()
        )
        eval_pend = (
            db.query(Evaluacion)
            .filter(
                Evaluacion.practica_id == p.id,
                Evaluacion.estado == EvaluacionEstadoEnum.PENDIENTE,
            )
            .first()
            is not None
        )
        out.append(
            PracticanteCentroOut(
                practicanteId=p.practicante_id,
                practicanteNombre=f"{p.practicante.nombres} {p.practicante.apellidos}",
                email=p.practicante.email,
                practicaId=p.id,
                aulaNombre=p.aula.nombre if p.aula else "",
                periodo=p.periodo,
                horasAcumuladas=p.horas_acumuladas,
                horasMinimas=p.horas_minimas,
                estado=p.estado.value,
                horasPendientes=pendientes,
                evaluacionPendiente=eval_pend,
            )
        )
    out.sort(key=lambda x: (-x.horasPendientes, x.practicanteNombre))
    return out


# ── HU-40 · Validación de horas de la bitácora ────────────────────────────────


@router.get("/horas", response_model=list[RegistroValidacionOut])
def list_horas_centro(
    solo_pendientes: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Registros de horas de los practicantes del centro, para su validación."""
    _solo_supervisor(current_user)
    practicas = {p.id: p for p in _practicas_del_centro(db, current_user)}
    if not practicas:
        return []

    q = db.query(RegistroHoras).filter(RegistroHoras.practica_id.in_(list(practicas)))
    if solo_pendientes:
        q = q.filter(RegistroHoras.estado_validacion == RegistroHorasEstadoEnum.PENDIENTE)

    registros = q.order_by(RegistroHoras.fecha.desc()).all()
    return [
        RegistroValidacionOut(
            id=r.id,
            practicaId=r.practica_id,
            practicanteNombre=(
                f"{practicas[r.practica_id].practicante.nombres} "
                f"{practicas[r.practica_id].practicante.apellidos}"
            ),
            fecha=r.fecha.isoformat() if r.fecha else "",
            horas=r.horas,
            descripcion=r.descripcion,
            estadoValidacion=r.estado_validacion.value,
        )
        for r in registros
    ]


@router.put("/horas/{registro_id}", response_model=RegistroValidacionOut)
def validar_horas(
    registro_id: str,
    payload: ValidarHorasRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Valida o rechaza un registro de horas; recalcula el total de la práctica."""
    _solo_supervisor(current_user)

    registro = db.query(RegistroHoras).filter(RegistroHoras.id == registro_id).first()
    if registro is None:
        raise HTTPException(status_code=404, detail="Registro no encontrado.")

    practicas = {p.id: p for p in _practicas_del_centro(db, current_user)}
    practica = practicas.get(registro.practica_id)
    if practica is None:
        raise HTTPException(
            status_code=403, detail="Este registro no pertenece a tu centro de prácticas."
        )

    registro.estado_validacion = RegistroHorasEstadoEnum(payload.estado)
    _recalcular_horas(db, practica)
    db.commit()
    db.refresh(registro)

    return RegistroValidacionOut(
        id=registro.id,
        practicaId=registro.practica_id,
        practicanteNombre=f"{practica.practicante.nombres} {practica.practicante.apellidos}",
        fecha=registro.fecha.isoformat() if registro.fecha else "",
        horas=registro.horas,
        descripcion=registro.descripcion,
        estadoValidacion=registro.estado_validacion.value,
    )


# ── HU-41 · Evaluación de desempeño ───────────────────────────────────────────


def _eval_out(e: Evaluacion, nombre: str) -> EvaluacionDetalleOut:
    return EvaluacionDetalleOut(
        id=e.id,
        practicaId=e.practica_id,
        practicanteNombre=nombre,
        periodo=e.periodo,
        estado=e.estado.value,
        fechaLimite=e.fecha_limite.isoformat() if e.fecha_limite else None,
        puntualidad=e.puntualidad,
        responsabilidad=e.responsabilidad,
        calidad=e.calidad,
        trabajoEquipo=e.trabajo_equipo,
        comentario=e.comentario or "",
        puntaje=e.puntaje,
    )


@router.get("/evaluaciones", response_model=list[EvaluacionDetalleOut])
def list_evaluaciones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluaciones de desempeño de los practicantes del centro."""
    _solo_supervisor(current_user)
    practicas = {p.id: p for p in _practicas_del_centro(db, current_user)}
    if not practicas:
        return []

    evaluaciones = (
        db.query(Evaluacion).filter(Evaluacion.practica_id.in_(list(practicas))).all()
    )
    out = []
    for e in evaluaciones:
        p = practicas[e.practica_id]
        out.append(_eval_out(e, f"{p.practicante.nombres} {p.practicante.apellidos}"))
    out.sort(key=lambda x: (x.estado != "PENDIENTE", x.practicanteNombre))
    return out


@router.put("/evaluaciones/{evaluacion_id}", response_model=EvaluacionDetalleOut)
def completar_evaluacion(
    evaluacion_id: str,
    payload: CompletarEvaluacionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Registra la rúbrica de desempeño y marca la evaluación como completada."""
    _solo_supervisor(current_user)

    evaluacion = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id).first()
    if evaluacion is None:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada.")

    practicas = {p.id: p for p in _practicas_del_centro(db, current_user)}
    practica = practicas.get(evaluacion.practica_id)
    if practica is None:
        raise HTTPException(
            status_code=403, detail="Esta evaluación no pertenece a tu centro de prácticas."
        )

    evaluacion.puntualidad = payload.puntualidad
    evaluacion.responsabilidad = payload.responsabilidad
    evaluacion.calidad = payload.calidad
    evaluacion.trabajo_equipo = payload.trabajoEquipo
    evaluacion.comentario = payload.comentario
    evaluacion.puntaje = round(
        (payload.puntualidad + payload.responsabilidad + payload.calidad + payload.trabajoEquipo)
        / 4
    )
    evaluacion.estado = EvaluacionEstadoEnum.COMPLETADA
    evaluacion.fecha_completada = datetime.now(timezone.utc)
    db.commit()
    db.refresh(evaluacion)

    return _eval_out(
        evaluacion, f"{practica.practicante.nombres} {practica.practicante.apellidos}"
    )


# ── Helpers del centro ────────────────────────────────────────────────────────


def _centro_del_supervisor(db: Session, user: User) -> tuple[Supervisor, list[Empresa]]:
    """Devuelve el registro de supervisor y todas las filas de empresa de su centro."""
    supervisor = db.query(Supervisor).filter(Supervisor.user_id == user.id).first()
    if supervisor is None:
        raise HTTPException(
            status_code=404, detail="Tu cuenta no está vinculada a un centro de prácticas."
        )
    empresa_base = db.query(Empresa).filter(Empresa.id == supervisor.empresa_id).first()
    if empresa_base is None:
        raise HTTPException(status_code=404, detail="Centro de prácticas no encontrado.")
    empresas = db.query(Empresa).filter(Empresa.ruc == empresa_base.ruc).all()
    return supervisor, empresas


# ── HU-43 · Datos del centro ──────────────────────────────────────────────────


@router.get("/centro", response_model=CentroOut)
def get_centro(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Datos del centro de prácticas y del supervisor que lo representa."""
    _solo_supervisor(current_user)
    supervisor, empresas = _centro_del_supervisor(db, current_user)
    base = empresas[0]
    return CentroOut(
        ruc=base.ruc,
        razonSocial=base.razon_social,
        direccion=base.direccion,
        sector=base.sector,
        telefono=base.telefono,
        email=base.email,
        practicantes=len(empresas),
        supervisorNombres=supervisor.nombres,
        supervisorApellidos=supervisor.apellidos,
        supervisorCargo=supervisor.cargo,
        supervisorEmail=supervisor.email,
        supervisorTelefono=supervisor.telefono,
    )


@router.put("/centro", response_model=CentroOut)
def update_centro(
    payload: UpdateCentroRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza los datos del centro. El cambio se aplica a las fichas de todos los
    practicantes del mismo RUC, para que la información quede consistente.
    El RUC no se modifica: identifica al centro.
    """
    _solo_supervisor(current_user)
    _, empresas = _centro_del_supervisor(db, current_user)
    for e in empresas:
        e.razon_social = payload.razonSocial
        e.direccion = payload.direccion
        e.sector = payload.sector
        e.telefono = payload.telefono
        e.email = payload.email
    db.commit()
    return get_centro(db, current_user)


@router.put("/centro/contacto", response_model=CentroOut)
def update_contacto_supervisor(
    payload: UpdateContactoSupervisorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Actualiza los datos de contacto del supervisor del centro."""
    _solo_supervisor(current_user)
    supervisor, _ = _centro_del_supervisor(db, current_user)
    supervisor.nombres = payload.nombres
    supervisor.apellidos = payload.apellidos
    supervisor.cargo = payload.cargo
    supervisor.email = payload.email
    supervisor.telefono = payload.telefono
    db.commit()
    return get_centro(db, current_user)


# ── HU-42 · Convenio y documentos ─────────────────────────────────────────────


def _doc_out(d: DocumentoCentro) -> DocumentoCentroOut:
    return DocumentoCentroOut(
        id=d.id,
        categoria=d.categoria,
        nombreOriginal=d.nombre_original,
        tipoMime=d.tipo_mime,
        tamanio=d.tamanio,
        subidoPorNombre=d.subido_por_nombre,
        fecha=d.created_at.isoformat() if d.created_at else "",
    )


@router.get("/documentos", response_model=list[DocumentoCentroOut])
def list_documentos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Documentos del vínculo académico con el centro (convenio, cartas, etc.)."""
    _solo_supervisor(current_user)
    _, empresas = _centro_del_supervisor(db, current_user)
    documentos = (
        db.query(DocumentoCentro)
        .filter(DocumentoCentro.ruc == empresas[0].ruc)
        .order_by(DocumentoCentro.created_at.desc())
        .all()
    )
    return [_doc_out(d) for d in documentos]


@router.post(
    "/documentos", response_model=DocumentoCentroOut, status_code=status.HTTP_201_CREATED
)
def subir_documento(
    categoria: str = Form("Convenio"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sube un documento del centro (máx. 20 MB)."""
    _solo_supervisor(current_user)
    _, empresas = _centro_del_supervisor(db, current_user)
    ruc = empresas[0].ruc

    contenido = file.file.read()
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="El archivo supera el límite de 20 MB.",
        )

    ext = Path(file.filename or "documento").suffix
    nombre_guardado = f"{uuid.uuid4().hex}{ext}"
    ruta_dir = UPLOAD_BASE / "centros" / ruc
    ruta_dir.mkdir(parents=True, exist_ok=True)
    (ruta_dir / nombre_guardado).write_bytes(contenido)

    doc = DocumentoCentro(
        ruc=ruc,
        categoria=categoria.strip() or "Convenio",
        nombre_original=file.filename or nombre_guardado,
        nombre_guardado=nombre_guardado,
        tipo_mime=file.content_type or "application/octet-stream",
        tamanio=len(contenido),
        subido_por_id=current_user.id,
        subido_por_nombre=f"{current_user.nombres} {current_user.apellidos}",
        created_at=datetime.now(timezone.utc),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _doc_out(doc)


@router.get("/documentos/{documento_id}/descargar")
def descargar_documento(
    documento_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Descarga un documento del centro."""
    _solo_supervisor(current_user)
    _, empresas = _centro_del_supervisor(db, current_user)

    doc = (
        db.query(DocumentoCentro)
        .filter(DocumentoCentro.id == documento_id, DocumentoCentro.ruc == empresas[0].ruc)
        .first()
    )
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado.")

    ruta = UPLOAD_BASE / "centros" / doc.ruc / doc.nombre_guardado
    if not ruta.exists():
        raise HTTPException(status_code=404, detail="El archivo no existe en el servidor.")

    return FileResponse(
        path=str(ruta), filename=doc.nombre_original, media_type=doc.tipo_mime
    )


@router.delete("/documentos/{documento_id}", status_code=204)
def eliminar_documento(
    documento_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Elimina un documento del centro."""
    _solo_supervisor(current_user)
    _, empresas = _centro_del_supervisor(db, current_user)

    doc = (
        db.query(DocumentoCentro)
        .filter(DocumentoCentro.id == documento_id, DocumentoCentro.ruc == empresas[0].ruc)
        .first()
    )
    if doc is None:
        raise HTTPException(status_code=404, detail="Documento no encontrado.")

    ruta = UPLOAD_BASE / "centros" / doc.ruc / doc.nombre_guardado
    if ruta.exists():
        ruta.unlink()
    db.delete(doc)
    db.commit()
