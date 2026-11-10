from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CategoriaCreate(BaseModel): nombre: str
class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    class Config: from_attributes = True

class ProductoCreate(BaseModel):
    nombre: str
    precio_base: float
    categoria_id: Optional[int] = None
class ProductoResponse(BaseModel):
    id: int
    nombre: str
    precio_base: float
    categoria_id: Optional[int] = None
    class Config: from_attributes = True
