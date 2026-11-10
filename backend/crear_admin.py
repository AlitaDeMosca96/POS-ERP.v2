from app.core.db.database import SessionLocal
from app.modules.empresa.models import Usuario
from passlib.context import CryptContext

db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. Arreglar tu usuario Santiago (eltanbarra@gmail.com) y hacerlo SuperAdmin
tu_user = db.query(Usuario).filter(Usuario.email == "eltanbarra@gmail.com").first()
if tu_user:
    tu_user.password_hash = pwd_context.hash("admin123")
    tu_user.es_superadmin = True
    print("Tu usuario fue actualizado. Contraseña: admin123")
else:
    # Si lo borraste, lo creamos de cero
    nuevo = Usuario(email="eltanbarra@gmail.com", nombre_completo="Santiago (Super Admin)", password_hash=pwd_context.hash("admin123"), es_superadmin=True)
    db.add(nuevo)
    print("Tu usuario fue creado. Contraseña: admin123")

# 2. Crear el usuario oficial de Soporte Global
soporte = db.query(Usuario).filter(Usuario.email == "soporte@pos-erp.com").first()
if not soporte:
    sup = Usuario(email="soporte@pos-erp.com", nombre_completo="Soporte Técnico", password_hash=pwd_context.hash("soporte2026"), es_superadmin=True)
    db.add(sup)
    print("Usuario de soporte creado: soporte@pos-erp.com / soporte2026")

db.commit()
db.close()
