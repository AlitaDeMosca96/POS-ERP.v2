from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.db.database import Base

class Venta(Base):
    __tablename__ = "ventas"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    establishment_id = Column(Integer, ForeignKey("establecimientos.id"), nullable=False)
    idempotency_key = Column(String, unique=True, nullable=False) # Evita cobro doble
    total = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    detalles = relationship("DetalleVenta")

class DetalleVenta(Base):
    __tablename__ = "detalles_venta"
    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    subtotal = Column(Numeric(10, 2), nullable=False)
    venta = relationship("Venta", back_populates="detalles")
