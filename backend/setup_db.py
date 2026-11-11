from app.core.db.database import SessionLocal
from app.modules.empresa.models import Empresa, Establecimiento, Usuario
import bcrypt

db = SessionLocal()

def generar_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# 1. Crear Empresa por defecto
if not db.query(Empresa).first():
    emp = Empresa(razon_social="Mi Restaurante S.A.", nombre_comercial="El Buen Sabor", pais="Argentina")
    db.add(emp)
    db.commit()
    db.refresh(emp)
    emp_id = emp.id
else:
    emp_id = db.query(Empresa).first().id

# 2. Crear Establecimiento por defecto
if not db.query(Establecimiento).first():
    est = Establecimiento(tenant_id=emp_id, nombre="Troya")
    db.add(est)
    db.commit()
    db.refresh(est)
    est_id = est.id
else:
    est_id = db.query(Establecimiento).first().id

# 3. Crear SuperAdmin
email_correcto = "eltanobarra@gmail.com"
tu_user = db.query(Usuario).filter(Usuario.email == email_correcto).first()
if tu_user:
    tu_user.password_hash = generar_hash("admin123")
    tu_user.es_superadmin = True
else:
    nuevo = Usuario(
        email=email_correcto, 
        nombre_completo="Santiago (Super Admin)", 
        password_hash=generar_hash("admin123"), 
        es_superadmin=True, 
        tenant_id=emp_id, 
        establishment_id=est_id
    )
    db.add(nuevo)
    
# 4. Usuario de soporte
soporte = db.query(Usuario).filter(Usuario.email == "soporte@pos-erp.com").first()
if not soporte:
    sup = Usuario(
        email="soporte@pos-erp.com", 
        nombre_completo="Soporte Técnico", 
        password_hash=generar_hash("soporte2026"), 
        es_superadmin=True, 
        tenant_id=emp_id, 
        establishment_id=est_id
    )
    db.add(sup)

db.commit()
db.close()
print("✅ Base de datos inicializada con Empresa, Local y SuperAdmin.")
