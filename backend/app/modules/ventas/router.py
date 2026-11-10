from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.ventas.models import Venta, DetalleVenta
from app.modules.ventas.schemas import VentaCreate, VentaResponse

router = APIRouter(tags=["Ventas"])

@router.post("/ventas/", response_model=VentaResponse)
def crear_venta(venta_in: VentaCreate, db: Session = Depends(get_db)):
    nueva_venta = Venta(total=venta_in.total)
    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)
    
    for det in venta_in.detalles:
        nuevo_det = DetalleVenta(venta_id=nueva_venta.id, producto_id=det.producto_id, cantidad=det.cantidad, subtotal=det.subtotal)
        db.add(nuevo_det)
    
    db.commit()
    return nueva_venta

@router.get("/ventas/", response_model=List[VentaResponse])
def listar_ventas(db: Session = Depends(get_db)):
    return db.query(Venta).all()
