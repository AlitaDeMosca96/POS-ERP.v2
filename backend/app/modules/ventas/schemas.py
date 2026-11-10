from pydantic import BaseModel
from typing import List

class DetalleVentaCreate(BaseModel):
    producto_id: int
    cantidad: int
    subtotal: float

class VentaCreate(BaseModel):
    idempotency_key: str
    total: float
    detalles: List[DetalleVentaCreate]

class VentaResponse(BaseModel):
    id: int
    total: float
    class Config: from_attributes = True
