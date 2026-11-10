from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmpresaBase(BaseModel):
    razon_social: str
    nombre_comercial: str
    identificacion_fiscal: Optional[str] = None
    pais: str = "Argentina"
    moneda: str = "ARS"
class EmpresaCreate(EmpresaBase): pass
class EmpresaResponse(EmpresaBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class EstablecimientoBase(BaseModel):
    empresa_id: int
    nombre: str
    tipo: str = "local"
    direccion: Optional[str] = None
    zona_horaria: str = "America/Argentina/Buenos_Aires"
    moneda_operativa: str = "ARS"
class EstablecimientoCreate(EstablecimientoBase): pass
class EstablecimientoResponse(EstablecimientoBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class UsuarioBase(BaseModel):
    email: str
    nombre_completo: str
class UsuarioCreate(UsuarioBase):
    password: str 
class UsuarioResponse(UsuarioBase):
    id: int
    activo: bool
    created_at: datetime
    class Config: from_attributes = True

class RolBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
class RolCreate(RolBase): pass
class RolResponse(RolBase):
    id: int
    class Config: from_attributes = True

class AccesoCreate(BaseModel):
    usuario_id: int
    establecimiento_id: int
    rol_id: int

class PermisoBase(BaseModel):
    rol_id: int
    recurso: str
    accion: str
    alcance: str
class PermisoCreate(PermisoBase): pass
class PermisoResponse(PermisoBase):
    id: int
    class Config: from_attributes = True
