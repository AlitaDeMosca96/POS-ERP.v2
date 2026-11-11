from pydantic import BaseModel
from typing import Optional

class EmpresaCreate(BaseModel):
    razon_social: str
    nombre_comercial: str
class EmpresaResponse(EmpresaCreate):
    id: int
    class Config: from_attributes = True

class EstablecimientoCreate(BaseModel):
    nombre: str
class EstablecimientoResponse(EstablecimientoCreate):
    id: int
    class Config: from_attributes = True

class UsuarioCreate(BaseModel):
    email: str
    nombre_completo: str
    password: str
class UsuarioResponse(BaseModel):
    id: int
    email: str
    nombre_completo: str
    class Config: from_attributes = True

class RolCreate(BaseModel):
    nombre: str
class RolResponse(RolCreate):
    id: int
    class Config: from_attributes = True

class AccesoCreate(BaseModel):
    usuario_id: int
    establecimiento_id: int
    rol_id: int

class PermisoCreate(BaseModel):
    rol_id: int
    recurso: str
    accion: str
    alcance: str
