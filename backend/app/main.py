from fastapi import FastAPI
from fastapi.responses import FileResponse
from app.core.config import settings
from app.modules.empresa.router import router as empresa_router
from app.modules.catalogo.router import router as catalogo_router
import os

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(empresa_router)
app.include_router(catalogo_router)

@app.get("/")
def leer_interfaz(): return FileResponse(os.path.join(os.path.dirname(__file__), "templates", "index.html"))

@app.get("/api/health")
def health_check(): return {"status": "ok"}
