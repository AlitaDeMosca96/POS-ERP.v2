from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.empresa.models import Empresa, Establecimiento, Usuario, Rol, Acceso
from app.modules.empresa.schemas import *

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
    if existe: raise HTTPException(status_code=400, detail="Email ya registrado")
    nuevo = Usuario(email=user_in.email, nombre_completo=user_in.nombre_completo, password_hash="hash_" + user_in.password)
    db.add(nuevo); db.commit(); db.refresh(nuevo)
    return nuevo

@router.get("/usuarios/", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).filter(Usuario.deleted_at == None).all()

@router.post("/roles/", response_model=RolResponse)
def crear_rol(rol_in: RolCreate, db: Session = Depends(get_db)):
    existe = db.query(Rol).filter(Rol.nombre == rol_in.nombre).first()
    if existe: raise HTTPException(status_code=400, detail="Ese rol ya existe")
    nuevo = Rol(**rol_in.model_dump())
    db.add(nuevo); db.commit(); db.refresh(nuevo)
    return nuevo

@router.get("/roles/", response_model=List[RolResponse])
def listar_roles(db: Session = Depends(get_db)):
    return db.query(Rol).filter(Rol.deleted_at == None).all()

@router.post("/accesos/")
def crear_acceso(acc_in: AccesoCreate, db: Session = Depends(get_db)):
    nuevo = Acceso(**acc_in.model_dump())
    db.add(nuevo); db.commit(); db.refresh(nuevo)
    return {"status": "ok"}

@router.get("/accesos/")
def listar_accesos(db: Session = Depends(get_db)):
    accesos = db.query(Acceso).filter(Acceso.deleted_at == None).all()
    resultado = []
    for a in accesos:
        resultado.append({
            "id": a.id,
            "usuario_nombre": a.usuario.nombre_completo,
            "establecimiento_nombre": a.establecimiento.nombre,
            "rol_nombre": a.rol.nombre
        })
    return resultado
