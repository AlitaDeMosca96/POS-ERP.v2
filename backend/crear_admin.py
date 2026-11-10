from app.core.db.database import SessionLocal
from app.modules.empresa.models import Usuario
import bcrypt

db = SessionLocal()

def generar_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Borrar el usuario con el typo (si llegó a crearse)
typo_user = db.query(Usuario).filter(Usuario.email == "eltanbarra@gmail.com").first()
if typo_user:
    db.delete(typo_user)
    db.commit()

# Crear tu usuario correcto como SuperAdmin
email_correcto = "eltanobarra@gmail.com"
tu_user = db.query(Usuario).filter(Usuario.email == email_correcto).first()

if tu_user:
    tu_user.password_hash = generar_hash("admin123")
    tu_user.es_superadmin = True
    print("Tu usuario fue actualizado. Contraseña: admin123")
else:
    nuevo = Usuario(email=email_correcto, nombre_completo="Santiago (Super Admin)", password_hash=generar_hash("admin123"), es_superadmin=True)
    db.add(nuevo)
    print("Tu usuario fue creado. Contraseña: admin123")

# El usuario de soporte queda igual
soporte = db.query(Usuario).filter(Usuario.email == "soporte@pos-erp.com").first()
if not soporte:
    sup = Usuario(email="soporte@pos-erp.com", nombre_completo="Soporte Técnico", password_hash=generar_hash("soporte2026"), es_superadmin=True)
    db.add(sup)
    print("Usuario de soporte creado: soporte@pos-erp.com / soporte2026")

db.commit()
db.close()
