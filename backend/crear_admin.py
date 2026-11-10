from app.core.db.database import SessionLocal
from app.modules.empresa.models import Usuario
import bcrypt

db = SessionLocal()

def generar_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# 1. Arreglar tu usuario Santiago
tu_user = db.query(Usuario).filter(Usuario.email == "eltanbarra@gmail.com").first()
if tu_user:
    tu_user.password_hash = generar_hash("admin123")
    tu_user.es_superadmin = True
    print("Tu usuario fue actualizado. Contraseña: admin123")
else:
    nuevo = Usuario(email="eltanbarra@gmail.com", nombre_completo="Santiago (Super Admin)", password_hash=generar_hash("admin123"), es_superadmin=True)
    db.add(nuevo)
    print("Tu usuario fue creado. Contraseña: admin123")

# 2. Crear el usuario oficial de Soporte Global
soporte = db.query(Usuario).filter(Usuario.email == "soporte@pos-erp.com").first()
if not soporte:
    sup = Usuario(email="soporte@pos-erp.com", nombre_completo="Soporte Técnico", password_hash=generar_hash("soporte2026"), es_superadmin=True)
    db.add(sup)
    print("Usuario de soporte creado: soporte@pos-erp.com / soporte2026")

db.commit()
db.close()
