from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.db.database import Base

class Empresa(Base):
    __tablename__ = "empresas"
    id = Column(Integer, primary_key=True, index=True)
    razon_social = Column(String, nullable=False)
    nombre_comercial = Column(String, nullable=False)
    pais = Column(String, default="Argentina")
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    establecimientos = relationship("Establecimiento", back_populates="empresa")

class Establecimiento(Base):
    __tablename__ = "establecimientos"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nombre = Column(String, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    empresa = relationship("Empresa", back_populates="establecimientos")

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=True) # SuperAdmin no tiene tenant fijo
    establishment_id = Column(Integer, ForeignKey("establecimientos.id"), nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nombre_completo = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    es_superadmin = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class Rol(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nombre = Column(String, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class Acceso(Base):
    __tablename__ = "accesos"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    establecimiento_id = Column(Integer, ForeignKey("establecimientos.id"), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class Permiso(Base):
    __tablename__ = "permisos"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    recurso = Column(String, nullable=False)
    accion = Column(String, nullable=False)
    alcance = Column(String, default="propio")
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    rol = relationship("Rol")

class Configuracion(Base):
    __tablename__ = "configuraciones"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    clave = Column(String, nullable=False)
    valor = Column(String, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
