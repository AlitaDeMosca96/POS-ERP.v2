from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.ventas.models import Venta, DetalleVenta
from app.modules.ventas.schemas import VentaCreate, VentaResponse
from app.modules.catalogo.models import Receta, Insumo, MovimientoStock

router = APIRouter(tags=["Ventas"])

@router.post("/ventas/", response_model=VentaResponse)
def crear_venta(venta_in: VentaCreate, x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)):
    # 1. REGLA DE IDEMPOTENCIA
    existe = db.query(Venta).filter(Venta.idempotency_key == venta_in.idempotency_key).first()
    if existe:
        return existe # Si ya existe, devolvemos la misma venta sin cobrar de nuevo

    # 2. CREAR VENTA
    nueva_venta = Venta(
        tenant_id=x_tenant_id, 
        establishment_id=x_est_id, 
        idempotency_key=venta_in.idempotency_key, 
        total=venta_in.total
    )
    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)

    # 3. GUARDAR DETALLES Y DESCONTAR STOCK (Regla D-108)
    for det in venta_in.detalles:
        db.add(DetalleVenta(venta_id=nueva_venta.id, producto_id=det.producto_id, cantidad=det.cantidad, subtotal=det.subtotal))
        
        # Buscamos la receta del producto para descontar insumos
        recetas = db.query(Receta).filter(Receta.producto_id == det.producto_id).all()
        for rec in recetas:
            cantidad_descontar = rec.cantidad * det.cantidad
            
            # Registramos el movimiento de stock
            mov = MovimientoStock(
                tenant_id=x_tenant_id, 
                establishment_id=x_est_id, 
                insumo_id=rec.insumo_id, 
                tipo="salida", 
                cantidad=cantidad_descontar, 
                motivo=f"Venta POS - Ticket #{nueva_venta.id}"
            )
            db.add(mov)
            
            # Actualizamos el stock actual del insumo
            insumo = db.query(Insumo).filter(Insumo.id == rec.insumo_id).first()
            if insumo:
                insumo.stock_actual -= cantidad_descontar

    db.commit()
    return nueva_venta

@router.get("/ventas/", response_model=List[VentaResponse])
def listar_ventas(x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)):
    return db.query(Venta).filter(Venta.tenant_id == x_tenant_id, Venta.establishment_id == x_est_id, Venta.deleted_at == None).all()
