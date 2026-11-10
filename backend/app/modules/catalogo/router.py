from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.catalogo.models import Categoria, Producto, Receta, Insumo
from app.modules.catalogo.schemas import *

router = APIRouter(tags=["Catalogo"])

@router.post("/insumos/", response_model=InsumoResponse)
def crear_insumo(insumo_in: InsumoCreate, x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)):
    nuevo = Insumo(**insumo_in.model_dump(), tenant_id=x_tenant_id, establishment_id=x_est_id)
    db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo

@router.get("/insumos/", response_model=List[InsumoResponse])
def listar_insumos(x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)): 
    return db.query(Insumo).filter(Insumo.tenant_id == x_tenant_id, Insumo.establishment_id == x_est_id, Insumo.deleted_at == None).all()

@router.post("/productos/", response_model=ProductoResponse)
def crear_producto(prod_in: ProductoCreate, x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)):
    nuevo = Producto(**prod_in.model_dump(), tenant_id=x_tenant_id, establishment_id=x_est_id)
    db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo

@router.get("/productos/", response_model=List[ProductoResponse])
def listar_productos(x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)): 
    return db.query(Producto).filter(Producto.tenant_id == x_tenant_id, Producto.establishment_id == x_est_id, Producto.deleted_at == None).all()

@router.post("/recetas/", response_model=RecetaResponse)
def crear_receta(rec_in: RecetaCreate, x_tenant_id: int = Header(...), db: Session = Depends(get_db)):
    nueva = Receta(**rec_in.model_dump(), tenant_id=x_tenant_id)
    db.add(nueva); db.commit(); db.refresh(nueva); return nueva

@router.get("/recetas/")
def listar_recetas(x_tenant_id: int = Header(...), x_est_id: int = Header(...), db: Session = Depends(get_db)):
    recetas = db.query(Receta).join(Producto).filter(Receta.tenant_id == x_tenant_id, Producto.establishment_id == x_est_id).all()
    return [{"id": r.id, "producto": r.producto.nombre, "insumo": r.insumo.nombre, "cantidad": r.cantidad, "unidad": r.insumo.unidad_consumo} for r in recetas]
