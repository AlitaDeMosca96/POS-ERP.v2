from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.empresa.models import Empresa, Establecimiento, Usuario, Rol, Acceso, Permiso
from app.modules.empresa.schemas import *
from passlib.context import CryptContext

router = APIRouter(tags=["Modulo Empresa"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# LOGIN
@router.post("/login")
def login(datos: dict, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.get("email")).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    # Verificamos la contraseña
    if not pwd_context.verify(datos.get("password"), usuario.password_hash):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    return {"status": "ok", "nombre": usuario.nombre_completo, "email": usuario.email}

@router.post("/empresas/", response_model=EmpresaResponse)
def crear_empresa(empresa_in: EmpresaCreate, db: Session = Depends(get_db)):
    nueva = Empresa(**empresa_in.model_dump()); db.add(nueva); db.commit(); db.refresh(nueva); return nueva
@router.get("/empresas/", response_model=List[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)): return db.query(Empresa).all()

@router.post("/establecimientos/", response_model=EstablecimientoResponse)
def crear_establecimiento(est_in: EstablecimientoCreate, db: Session = Depends(get_db)):
    nuevo = Establecimiento(**est_in.model_dump()); db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo
@router.get("/establecimientos/", response_model=List[EstablecimientoResponse])
def listar_establecimientos(db: Session = Depends(get_db)): return db.query(Establecimiento).all()

@router.post("/usuarios/", response_model=UsuarioResponse)
def crear_usuario(user_in: UsuarioCreate, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.email == user_in.email).first()
    if existe: raise HTTPException(status_code=400, detail="Email ya registrado")
    
    # ENCRIPTAMOS LA CONTRASEÑA REAL
    hash_real = pwd_context.hash(user_in.password)
    
    nuevo = Usuario(email=user_in.email, nombre_completo=user_in.nombre_completo, password_hash=hash_real)
    db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo
@router.get("/usuarios/", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)): return db.query(Usuario).all()

@router.post("/roles/", response_model=RolResponse)
def crear_rol(rol_in: RolCreate, db: Session = Depends(get_db)):
    nuevo = Rol(**rol_in.model_dump()); db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo
@router.get("/roles/", response_model=List[RolResponse])
def listar_roles(db: Session = Depends(get_db)): return db.query(Rol).all()

@router.post("/accesos/")
def crear_acceso(acc_in: AccesoCreate, db: Session = Depends(get_db)):
    nuevo = Acceso(**acc_in.model_dump()); db.add(nuevo); db.commit(); db.refresh(nuevo); return {"status": "ok"}
@router.get("/accesos/")
def listar_accesos(db: Session = Depends(get_db)):
    accesos = db.query(Acceso).all()
    return [{"id": a.id, "usuario_nombre": a.usuario.nombre_completo, "establecimiento_nombre": a.establecimiento.nombre, "rol_nombre": a.rol.nombre} for a in accesos]

@router.post("/permisos/")
def crear_permiso(perm_in: PermisoCreate, db: Session = Depends(get_db)):
    nuevo = Permiso(**perm_in.model_dump()); db.add(nuevo); db.commit(); db.refresh(nuevo); return {"status": "ok"}
@router.get("/permisos/")
def listar_permisos(db: Session = Depends(get_db)):
    permisos = db.query(Permiso).all()
    return [{"id": p.id, "rol_nombre": p.rol.nombre, "recurso": p.recurso, "accion": p.accion, "alcance": p.alcance} for p in permisos]
