from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "POS + ERP Gastronómico"
    VERSION: str = "3.1.0"
    DATABASE_URL: str = "sqlite:///./pos_erp.db"

settings = Settings()
