## Módulo de Plataforma Técnica y Seguridad (Bloque 13)

### Sincronización y Resolución de Conflictos
- **Transacciones (Automático)**: Ventas y movimientos de stock se suman y recalculan sin intervención.
- **Configuración (Revisión manual)**: Si hay cambios simultáneos de precios o menús, el sistema frena y alerta al dueño para que elija qué versión prevalece.

### Seguridad de Terminales y Timeout
- **Configurable**: El dueño define los minutos de inactividad y el método de desbloqueo (PIN rápido para operativos o contraseña completa para perfiles administrativos).

### Actualizaciones del Agente Local
- **Configurable**: El Super-admin define si la actualización es forzada (obligatoria) o si se notifica al cliente para que elija el momento de instalación.

### Backups y Restauración
- **Configurable**: Permite definir la política de respaldo según el plan (ej. copia diaria para planes básicos, restauración Point-in-Time al minuto para planes Enterprise).

### API Pública y Webhooks (Límites)
- **Configurable**: Rate limiting (límite de consultas por minuto/hora) ajustable por el Super-admin según el plan del cliente.

### Seguridad de Datos Locales y Robo de Hardware
- **Encriptación local**: La base de datos del Agente Local está encriptada.
- **Borrado Remoto (Remote Wipe)**: Posibilidad de enviar un comando desde el Super-admin para destruir los datos de una terminal en caso de robo, tan pronto como se conecte a internet.

### Residencia de Datos (Multi-región)
- **Configurable**: El Super-admin asigna la región/servidor de alojamiento por cada empresa (tenant), permitiendo cumplir con normativas locales (ej. GDPR en Europa).

### Monitoreo de Errores y Telemetría
- **Configurable**: Define qué tipos de errores se reportan automáticamente al Super-admin (críticos vs. menores) con datos de contexto (usuario, acción, paso a paso).

### Motor de Notificaciones
- **Configurable**: Permite usar la cuenta global del SaaS (para planes básicos) o que el cliente conecte su propia cuenta (BYOP - Bring Your Own Provider) para correos/WhatsApp con su propio dominio y costos.

### Archivado de Datos Históricos
- **Configurable**: Define a partir de qué cantidad de años los datos pasan a un almacenamiento frío (consultable pero más lento). Opción premium para mantener todo activo.

### Conectividad de Terminales (Agente Local)
- **Configurable**: Soporte para autodescubrimiento (ZeroConf) en la misma red, vinculación rápida mediante escaneo de Código QR, o configuración manual por IP estática.

