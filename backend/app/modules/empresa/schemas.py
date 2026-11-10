from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmpresaBase(BaseModel):
    razon_social: str
    nombre_comercial: str
    identificacion_fiscal: Optional[str] = None
    pais: str = "Argentina"
    moneda: str = "ARS"

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaResponse(EmpresaBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class EstablecimientoBase(BaseModel):
    empresa_id: int
    nombre: str
    tipo: str = "local"
    direccion: Optional[str] = None
    zona_horaria: str = "America/Argentina/Buenos_Aires"
    moneda_operativa: str = "ARS"

class EstablecimientoCreate(EstablecimientoBase):
    pass

class EstablecimientoResponse(EstablecimientoBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    email: str
    nombre_completo: str

class UsuarioCreate(UsuarioBase):
    password: str 

class UsuarioResponse(UsuarioBase):
    id: int
    activo: bool
    created_at: datetime
    class Config:
        from_attributes = True
