from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.empresa.models import Empresa, Establecimiento, Usuario, Rol, Acceso, Permiso
from app.modules.empresa.schemas import *
import bcrypt

router = APIRouter(tags=["Modulo Empresa"])

def verificar_password(plain: str, hashed: str):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
def generar_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@router.post("/login")
def login(datos: dict, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.get("email")).first()
    if not usuario: raise HTTPException(status_code=401, detail="Usuario no encontrado")
    try:
        if not verificar_password(datos.get("password"), usuario.password_hash): raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    except: raise HTTPException(status_code=401, detail="Error en contraseña")

    return {
        "status": "ok", 
        "nombre": usuario.nombre_completo, 
        "email": usuario.email, 
        "es_superadmin": usuario.es_superadmin,
        "tenant_id": usuario.tenant_id,
        "establecimiento_id": usuario.establishment_id
    }

@router.post("/empresas/", response_model=EmpresaResponse)
def crear_empresa(empresa_in: EmpresaCreate, db: Session = Depends(get_db)):
    nueva = Empresa(**empresa_in.model_dump()); db.add(nueva); db.commit(); db.refresh(nueva); return nueva
@router.get("/empresas/", response_model=List[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)): return db.query(Empresa).filter(Empresa.deleted_at == None).all()

@router.post("/establecimientos/", response_model=EstablecimientoResponse)
def crear_establecimiento(est_in: EstablecimientoCreate, x_tenant_id: int = Header(...), db: Session = Depends(get_db)):
    nuevo = Establecimiento(tenant_id=x_tenant_id, nombre=est_in.nombre); db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo
@router.get("/establecimientos/", response_model=List<EstablecimientoResponse>)
def listar_establecimientos(x_tenant_id: int = Header(...), db: Session = Depends(get_db)): 
    return db.query(Establecimiento).filter(Establecimiento.tenant_id == x_tenant_id, Establecimiento.deleted_at == None).all()

@router.post("/usuarios/", response_model=UsuarioResponse)
def crear_usuario(user_in: UsuarioCreate, x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.email == user_in.email).first()
    if existe: raise HTTPException(status_code=400, detail="Email ya registrado")
    nuevo = Usuario(email=user_in.email, nombre_completo=user_in.nombre_completo, password_hash=generar_hash(user_in.password), tenant_id=x_tenant_id, establishment_id=x_est_id)
    db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo
@router.get("/usuarios/", response_model=List[UsuarioResponse])
def listar_usuarios(x_tenant_id: int = Header(...), db: Session = Depends(get_db)): 
    return db.query(Usuario).filter(Usuario.tenant_id == x_tenant_id, Usuario.deleted_at == None).all()

@router.post("/roles/", response_model=RolResponse)
def crear_rol(rol_in: RolCreate, x_tenant_id: int = Header(...), db: Session = Depends(get_db)):
    nuevo = Rol(nombre=rol_in.nombre, tenant_id=x_tenant_id); db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo
@router.get("/roles/", response_model=List<RolResponse>)
def listar_roles(x_tenant_id: int = Header(...), db: Session = Depends(get_db)): 
    return db.query(Rol).filter(Rol.tenant_id == x_tenant_id, Rol.deleted_at == None).all()
