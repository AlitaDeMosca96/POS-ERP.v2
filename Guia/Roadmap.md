# Roadmap de Desarrollo (Fases)

## Estrategia: MVP End-to-End (Walking Skeleton)
Construiremos una versión mínima que conecte todos los extremos del sistema: desde que vos creas un cliente en el Super-admin, hasta que un mozo cobra en el POS y se descuenta el stock.

### Fase 1: MVP (Producto Mínimo Viable)
- **Super-admin Core:** Gestión de Tenants (empresas), licencias y usuarios.
- **Núcleo POS:** Apertura/cierre de caja, toma de pedidos básicos (mesas/mostrador), cobro simple (efectivo/tarjeta).
- **Catálogo e Inventario Básico:** Productos, precios, descuento automático de stock e insumos básicos.
- **Facturación:** Integración con proveedor externo para emitir tickets/facturas.

### Fase 2: Operación y Control
- KDS (Pantalla de Cocina).
- Modificadores de productos y manejo de tiempos (Courses).
- Compras y Proveedores básicos.
- Cierre de caja ciego y control de propinas.

### Fase 3: Finanzas y Expansión
- Tesorería, bancos y conciliación.
- Motor contable automático.
- Módulo de RRHH (asistencia y turnos).
- Integraciones con Apps de Delivery.

### Fase 4: El ERP Completo
- Módulos avanzados: Producción, Inocuidad (HACCP), CRM, IA (Forecast).
- Soporte Multi-país y multi-moneda completo.
- Portal del empleado y BI Avanzado.

### Estrategia Offline (Híbrido)
- **Fase 1 (Cloud-First):** El MVP inicial requiere conexión a internet para funcionar.
- **Diseño Preparado:** La base de datos y las APIs se diseñan con identificadores únicos (UUIDs) y marcas de tiempo, preparadas para la futura sincronización bidireccional.
- **Fase 2 (Agente Local):** Se implementa el Agente Local (Electron + SQLite) para habilitar el modo offline total una vez estabilizado el flujo en la nube.

