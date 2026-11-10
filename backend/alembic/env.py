from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys, os
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))
from app.core.db.database import Base
from app.modules.empresa.models import Empresa, Establecimiento, Usuario, Rol, Acceso, Permiso, Configuracion
from app.modules.catalogo.models import Insumo, Categoria, Producto, Receta
from app.core.config import settings

config = context.config
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)
if config.config_file_name is not None: fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_online() -> None:
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
run_migrations_online()
