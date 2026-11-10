from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db.database import get_db
from app.modules.catalogo.models import Categoria, Producto
from app.modules.catalogo.schemas import *

router = APIRouter(tags=["Catalogo"])

@router.post("/categorias/", response_model=CategoriaResponse)
def crear_categoria(cat_in: CategoriaCreate, db: Session = Depends(get_db)):
    nueva = Categoria(**cat_in.model_dump()); db.add(nueva); db.commit(); db.refresh(nueva); return nueva
@router.get("/categorias/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)): return db.query(Categoria).all()

@router.post("/productos/", response_model=ProductoResponse)
def crear_producto(prod_in: ProductoCreate, db: Session = Depends(get_db)):
    nuevo = Producto(**prod_in.model_dump()); db.add(nuevo); db.commit(); db.refresh(nuevo); return nuevo
@router.get("/productos/", response_model=List[ProductoResponse])
def listar_productos(db: Session = Depends(get_db)): return db.query(Producto).all()
