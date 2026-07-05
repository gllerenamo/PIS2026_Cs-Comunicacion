import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base

# ── Enums (deben coincidir con los tipos del frontend) ─────────────────────────

import enum


class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    PROFESOR = "PROFESOR"
    ALUMNO = "ALUMNO"


class AulaEstadoEnum(str, enum.Enum):
    ACTIVA = "ACTIVA"
    CONCLUIDA = "CONCLUIDA"


class ActividadEstadoEnum(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    SIN_LEER = "SIN_LEER"
    CALIFICADA = "CALIFICADA"


class EntregaEstadoEnum(str, enum.Enum):
    ENTREGADA = "ENTREGADA"
    CALIFICADA = "CALIFICADA"


# ── Tablas ──────────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: f"u-{uuid.uuid4().hex[:10]}")
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.ALUMNO)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    aulas = relationship("Aula", back_populates="profesor")


class Aula(Base):
    __tablename__ = "aulas"

    id = Column(String, primary_key=True, default=lambda: f"a-{uuid.uuid4().hex[:10]}")
    nombre = Column(String(200), nullable=False)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    descripcion = Column(Text, nullable=False, default="")
    periodo = Column(String(20), nullable=False)
    profesor_id = Column(String, ForeignKey("users.id"), nullable=False)
    estado = Column(Enum(AulaEstadoEnum), nullable=False, default=AulaEstadoEnum.ACTIVA)
    inscritos = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    profesor = relationship("User", back_populates="aulas")


class Inscripcion(Base):
    """Matrícula de un alumno en un aula, con su avance (HU-05)."""

    __tablename__ = "inscripciones"

    id = Column(String, primary_key=True, default=lambda: f"i-{uuid.uuid4().hex[:10]}")
    alumno_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    aula_id = Column(String, ForeignKey("aulas.id"), nullable=False, index=True)
    progreso = Column(Integer, nullable=False, default=0)  # 0–100
    semana_actual = Column(Integer, nullable=False, default=0)
    semanas_totales = Column(Integer, nullable=False, default=16)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    alumno = relationship("User")
    aula = relationship("Aula")


class Archivo(Base):
    """Archivo subido a un aula (HU-07/08)."""

    __tablename__ = "archivos"

    id = Column(String, primary_key=True, default=lambda: f"arc-{uuid.uuid4().hex[:8]}")
    aula_id = Column(String, ForeignKey("aulas.id"), nullable=False, index=True)
    subido_por_id = Column(String, ForeignKey("users.id"), nullable=False)
    nombre_original = Column(String(255), nullable=False)
    nombre_guardado = Column(String(255), unique=True, nullable=False)
    tipo_mime = Column(String(100), nullable=False)
    tamanio = Column(Integer, nullable=False)  # bytes
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    aula = relationship("Aula")
    subido_por = relationship("User", foreign_keys=[subido_por_id])


class Tarea(Base):
    """Tarea asignada a un aula por el profesor (HU-09)."""

    __tablename__ = "tareas"

    id = Column(String, primary_key=True, default=lambda: f"t-{uuid.uuid4().hex[:8]}")
    aula_id = Column(String, ForeignKey("aulas.id"), nullable=False, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False, default="")
    fecha_limite = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    aula = relationship("Aula")
    entregas = relationship("Entrega", back_populates="tarea")


class Entrega(Base):
    """Entrega de un alumno a una tarea (HU-09)."""

    __tablename__ = "entregas"

    id = Column(String, primary_key=True, default=lambda: f"ent-{uuid.uuid4().hex[:8]}")
    tarea_id = Column(String, ForeignKey("tareas.id"), nullable=False, index=True)
    alumno_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    descripcion = Column(Text, nullable=False, default="")
    comentario = Column(Text, nullable=False, default="")
    archivo_id = Column(String, ForeignKey("archivos.id"), nullable=True)
    estado = Column(
        Enum(EntregaEstadoEnum),
        nullable=False,
        default=EntregaEstadoEnum.ENTREGADA,
    )
    nota = Column(Integer, nullable=True)        # 0–20
    retroalimentacion = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    tarea = relationship("Tarea", back_populates="entregas")
    alumno = relationship("User", foreign_keys=[alumno_id])
    archivo = relationship("Archivo")


class ActividadReciente(Base):
    """Ítem del feed de actividad reciente de un alumno (HU-05)."""

    __tablename__ = "actividad_reciente"

    id = Column(String, primary_key=True, default=lambda: f"act-{uuid.uuid4().hex[:8]}")
    alumno_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    titulo = Column(String(200), nullable=False)
    contexto = Column(String(255), nullable=False, default="")
    tiempo = Column(String(60), nullable=False, default="")
    estado = Column(Enum(ActividadEstadoEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    alumno = relationship("User")
