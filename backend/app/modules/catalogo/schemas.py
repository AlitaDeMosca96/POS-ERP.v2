from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InsumoBase(BaseModel):
    nombre: str
    unidad_compra: str
    unidad_consumo: str
    factor_conversion: float
class InsumoCreate(InsumoBase): pass
class InsumoResponse(InsumoBase):
    id: int
    stock_actual: float
    class Config: from_attributes = True

class CategoriaCreate(BaseModel): nombre: str
class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    class Config: from_attributes = True

class ProductoBase(BaseModel):
    nombre: str
    precio_base: float
    categoria_id: Optional[int] = None
class ProductoCreate(ProductoBase): pass
class ProductoResponse(ProductoBase):
    id: int
    class Config: from_attributes = True

class RecetaCreate(BaseModel):
    producto_id: int
    insumo_id: int
    cantidad: float
class RecetaResponse(BaseModel):
    id: int
    producto_id: int
    insumo_id: int
    cantidad: float
    class Config: from_attributes = True
