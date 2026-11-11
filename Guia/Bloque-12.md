## Módulo Super-admin y Operación SaaS (Bloque 12)

### Onboarding de Nuevos Clientes (Tenants)
- **Configurable**: Permite habilitar el registro autogestionado (self-service) o la creación manual de cuentas desde el panel de Super-admin para ventas asistidas o Enterprise.

### Baja de Clientes (Churn) y Retención de Datos
- **Configurable**: El Super-admin define el período de gracia (ej. 30, 60, 90 días) tras la cancelación, donde la cuenta se suspende pero los datos se conservan. Pasado ese tiempo, se purgan definitivamente.

### Soporte y Impersonación (Entrar como Usuario)
- **Configurable**: Permite modo visible (aviso en pantalla al cliente) o silencioso (solo para diagnóstico técnico avanzado).
- **Auditoría obligatoria**: Todo acceso de Super-admin a una cuenta queda registrado con fecha, hora y motivo.

### Facturación del SaaS (Cobro a Clientes)
- **Configurable**: Permite habilitar suscripciones automáticas (débito con tarjeta/pasarela) o cobro manual (transferencia, link de pago, facturación tradicional).

### Dashboard del Super-admin (Métricas SaaS)
- **Configurable**: Tablero principal personalizable con widgets de métricas SaaS (MRR, Churn, LTV, Empresas activas, estado de servidores, etc.).

### Gestión de Partners (Revendedores)
- **Configurable**: Permite otorgar un portal de autogestión a partners grandes o gestionar internamente a los partners pequeños desde el Super-admin.

### Modo Mantenimiento
- **Configurable**: Permite aplicar bloqueo total, modo de solo lectura (consulta sin ventas) o afectar solo a módulos específicos, con cartel de aviso personalizable.

### Anuncios Globales y Comunicación
- **Configurable**: Permite mostrar avisos en pantalla (banners/notificaciones in-app), enviar emails masivos, o ambos, para comunicar nuevas funciones o avisos importantes.

### Límites de Planes y Excedentes
- **Configurable**: El Super-admin define si el sistema bloquea la acción (ej. crear sucursal extra) o si permite el excedente (overage) y lo factura automáticamente al cierre del mes.

### Migración e Importación de Datos
- **Configurable**: Permite herramientas de autoservicio (importación CSV/Excel) para planes básicos, y migración asistida por el equipo de Super-admin para planes Enterprise.

### Roles del Equipo Interno (Super-admin)
- **Configurable (Permisos granulares)**: Permite crear sub-usuarios para el equipo interno (Soporte, Ventas, Finanzas) con permisos limitados para no exponer el control total de la plataforma.

### Gestión de Morosidad (Dunning)
- **Configurable**: Permite definir días de gracia, secuencia de avisos automáticos (emails/notificaciones) y el momento exacto del bloqueo por falta de pago.

### Acceso al Soporte Técnico
- **Configurable**: Permite un botón de ayuda externo (redirección) o un widget de chat integrado en la app (que comparte datos del tenant automáticamente).

### Alertas Críticas para el Super-admin
- **Configurable**: El administrador define qué eventos disparan alertas (caídas de servidores, churn de clientes grandes, excedentes de plan) y por qué canal recibirlas (Panel, Email, Push).

### Promociones Comerciales del SaaS
- **Configurable**: Permite ajustes manuales de precio por cliente o la creación de un motor de cupones automáticos (códigos de descuento, vigencias, límites de uso).

