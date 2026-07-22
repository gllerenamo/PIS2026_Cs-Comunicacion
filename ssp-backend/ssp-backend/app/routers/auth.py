"""
Módulo IAM — endpoints de autenticación.
Rutas: /api/v1/auth/*
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import (
    CambiarPasswordRequest,
    LoginRequest,
    LoginResponse,
    RecoverRequest,
    RecoverResponse,
    RegisterRequest,
    UpdatePerfilRequest,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ── POST /api/v1/auth/login ────────────────────────────────────────────────────


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica al usuario y devuelve un JWT real + datos públicos del usuario.
    Equivale al mock: authService.login()
    Errores: 401 si credenciales incorrectas.
    """
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    token = create_access_token(
        data={"sub": user.id, "role": user.role.value, "email": user.email}
    )
    return LoginResponse(token=token, user=UserOut.model_validate(user))


# ── POST /api/v1/auth/register ─────────────────────────────────────────────────


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Crea una nueva cuenta.
    Equivale al mock: authService.register()
    Errores: 409 si el correo ya existe.
    """
    email = body.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con este correo.",
        )

    user = User(
        nombres=body.nombres,
        apellidos=body.apellidos,
        email=email,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


# ── POST /api/v1/auth/recover ──────────────────────────────────────────────────


@router.post("/recover", response_model=RecoverResponse)
def recover(body: RecoverRequest, db: Session = Depends(get_db)):
    """
    Solicita restablecimiento de contraseña.
    La respuesta es siempre 200 (no filtramos si el correo existe).
    Equivale al mock: authService.requestPasswordReset()
    """
    # En producción: enviar email con link de reset aquí.
    # Por ahora la respuesta es uniforme independientemente del correo.
    _ = db.query(User).filter(User.email == body.email.lower()).first()
    return RecoverResponse(
        message="Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
    )


# ── HU-46 · Perfil personal ───────────────────────────────────────────────────


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Datos del usuario autenticado."""
    return UserOut.model_validate(current_user)


@router.put("/perfil", response_model=UserOut)
def update_perfil(
    body: UpdatePerfilRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Actualiza los datos personales. El rol no se puede cambiar desde aquí."""
    email = body.email.lower()
    if email != current_user.email:
        existe = db.query(User).filter(User.email == email, User.id != current_user.id).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una cuenta con este correo.",
            )
    current_user.nombres = body.nombres
    current_user.apellidos = body.apellidos
    current_user.email = email
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.put("/password", response_model=RecoverResponse)
def cambiar_password(
    body: CambiarPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cambia la contraseña verificando primero la actual."""
    if not verify_password(body.passwordActual, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual no es correcta.",
        )
    current_user.hashed_password = hash_password(body.passwordNueva)
    db.commit()
    return RecoverResponse(message="Contraseña actualizada correctamente.")
