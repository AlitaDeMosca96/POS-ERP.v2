## Modelo de Datos: Núcleo (Bloque 1)

### Identificación del Tenant
- Acceso por subdominio propio (ej. cliente.tuapp.com).
- Login alternativo por Email + Selección de Empresa (para usuarios multi-empresa/grupos).
- CUIT/RUT obligatorio en la entidad Empresa (para facturación y validaciones).
- Identificador interno (UUID) para la base de datos y super-admin.

### Entidades Principales: Usuarios y Accesos
- Un usuario puede estar asociado a múltiples Empresas y Sucursales (Many-to-Many).
- Al loguearse, el sistema muestra un selector de Contexto (Empresa/Sucursal activa).
- El rol del usuario es dinámico según el contexto (ej. Admin en Sucursal 1, Cajero en Sucursal 2).
- Cuenta con PIN rápido para terminales POS y SSO para backoffice.

### Validación de Licencia y Telemetría
- **Telemetría en tiempo real**: Uso de WebSockets o canal ligero para monitoreo del local (estado, errores, hardware) desde el Super-admin.
- **Validación de licencia por Token**: El Agente Local almacena un token criptográfico con vencimiento (ej. 24hs). Funciona offline hasta que vence.
- **Sincronización en segundo plano**: El agente renueva el token y sincroniza datos periódicamente sin interrumpir la operación.
- **Revocación**: Si el local está online, el bloqueo es inmediato. Si está offline, se aplica al vencer el token.

### Política de Auditoría
- **Registro selectivo**: Se auditan todas las acciones de escritura (crear, modificar, borrar), transaccionales (cobros, anulaciones) y de seguridad (login, cambios de permisos).
- **Excepción de lectura**: Se registran lecturas solo para datos sensibles (recetas confidenciales, exportaciones de sueldos).
- **Inmutabilidad**: Los logs de auditoría no se pueden editar ni borrar (ni por el Super-admin).

### Roles y Permisos
- **Motor de permisos granular (RBAC)**: Basado en acciones (crear, leer, editar, borrar).
- **Agrupación visual por módulos**: La UI agrupa los permisos para facilitar la configuración.
- **Roles base inmutables**: Dueño, Gerente, Cajero, Mozo, Cocina (traen permisos preconfigurados).
- **Roles personalizados**: El cliente puede clonar un rol base y ajustar los permisos granulares.

### Plantillas y Configuración
- **Herencia con Overrides**: Las sucursales heredan la configuración maestra (carta, precios, recetas).
- **Modificación local**: La sucursal puede pisar un ítem (override) sin afectar al resto.
- **Propagación**: Los cambios en la plantilla maestra se reflejan en todas las sucursales, excepto donde haya un override local.
- **Control de versiones**: Historial de cambios de plantillas para saber qué configuración estaba vigente en cada fecha.

### Configuración Regional y Multi-moneda
- **Nivel Empresa (Default)**: Define la moneda base, idioma y zona horaria principal.
- **Nivel Sucursal (Override)**: Puede operar con una moneda local, idioma y zona horaria distinta a la matriz.
- **Tipo de cambio dinámico**: El sistema guarda la cotización del día para consolidar reportes en la moneda base de la empresa.

### Integridad de Datos (Soft Delete)
- **Nada se borra físicamente**: Todos los registros (productos, clientes, empleados) usan borrado lógico.
- **Estados**: Activo, Inactivo (no aparece en operaciones nuevas) y Eliminado (oculto para el usuario, pero conservado para auditoría e históricos).
- **Integridad referencial**: Las ventas y asientos contables del pasado siempre podrán leer los datos del producto o cliente aunque esté eliminado.

### Búsqueda y Navegación
- **Búsqueda contextual**: Cada módulo tiene su propio buscador avanzado (filtros por fechas, estados, categorías).
- **Sin buscador global**: Se evita la complejidad y los problemas de permisos cruzados entre módulos en el núcleo.

### Alta de Usuarios y Accesos
- **Invitación por Email**: Para perfiles administrativos (Dueño, Gerente, Contador), permite crear contraseña y usar SSO.
- **Contraseña Temporal / PIN**: Para perfiles operativos (Mozos, Cocineros), el gerente crea el usuario y le asigna un PIN directo para usar en el POS. No requiere email.
- **Cambio obligatorio**: En el primer login con contraseña temporal, el sistema exige cambiarla.

### Feature Flags (Control de Funciones)
- **Interruptor Global (Kill Switch)**: Control maestro desde el Super-admin para apagar un módulo crítico para TODOS los clientes al instante (ej. por bug o caída externa).
- **Configuración por Tenant**: Habilitación de módulos según el plan o tipo de negocio (ej. Kiosco, IA).
- **Jerarquía**: El interruptor global siempre pisa la configuración del cliente.

