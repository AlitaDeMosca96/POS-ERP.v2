from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.db.database import Base

class Insumo(Base):
    __tablename__ = "insumos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    unidad_compra = Column(String, nullable=False)
    unidad_consumo = Column(String, nullable=False)
    factor_conversion = Column(Numeric(10, 4), nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    nombre = Column(String, nullable=False)
    precio_base = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    categoria = relationship("Categoria")
    recetas = relationship("Receta", back_populates="producto")

class Receta(Base):
    __tablename__ = "recetas"
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    insumo_id = Column(Integer, ForeignKey("insumos.id"), nullable=False)
    cantidad = Column(Numeric(10, 4), nullable=False) # Ej: 0.200 (kilos)
    merma_porcentaje = Column(Numeric(5, 2), default=0) # Ej: 5 (%)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    producto = relationship("Producto", back_populates="recetas")
    insumo = relationship("Insumo")
