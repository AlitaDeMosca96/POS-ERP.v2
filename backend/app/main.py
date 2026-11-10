from fastapi import FastAPI
from fastapi.responses import FileResponse
from app.core.config import settings
from app.modules.empresa.router import router as empresa_router
import os

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.include_router(empresa_router)

# Esta ruta sirve la pantalla visual
@app.get("/")
def leer_interfaz():
    file_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    return FileResponse(file_path)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "proyecto": settings.PROJECT_NAME}
