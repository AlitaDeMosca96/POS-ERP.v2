from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.empresa.models import Empresa, Establecimiento, Usuario
from app.modules.empresa.schemas import (
    EmpresaCreate, EmpresaResponse,
    EstablecimientoCreate, EstablecimientoResponse,
    UsuarioCreate, UsuarioResponse
)

router = APIRouter(tags=["Modulo Empresa"])

@router.post("/empresas/", response_model=EmpresaResponse)
def crear_empresa(empresa_in: EmpresaCreate, db: Session = Depends(get_db)):
    nueva = Empresa(**empresa_in.model_dump())
    db.add(nueva); db.commit(); db.refresh(nueva)
    return nueva

@router.get("/empresas/", response_model=List[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)):
    return db.query(Empresa).filter(Empresa.deleted_at == None).all()

@router.post("/establecimientos/", response_model=EstablecimientoResponse)
def crear_establecimiento(est_in: EstablecimientoCreate, db: Session = Depends(get_db)):
    nuevo = Establecimiento(**est_in.model_dump())
    db.add(nuevo); db.commit(); db.refresh(nuevo)
    return nuevo

@router.get("/establecimientos/", response_model=List[EstablecimientoResponse])
def listar_establecimientos(db: Session = Depends(get_db)):
    return db.query(Establecimiento).filter(Establecimiento.deleted_at == None).all()

@router.post("/usuarios/", response_model=UsuarioResponse)
def crear_usuario(user_in: UsuarioCreate, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.email == user_in.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    nuevo = Usuario(
        email=user_in.email, 
        nombre_completo=user_in.nombre_completo,
        password_hash="hash_" + user_in.password
    )
    db.add(nuevo); db.commit(); db.refresh(nuevo)
    return nuevo

@router.get("/usuarios/", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).filter(Usuario.deleted_at == None).all()
