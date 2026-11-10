# GUÍA MÁXIMA — SISTEMA POS + ERP GASTRONÓMICO
**Versión:** 3.1 FINAL CONSOLIDADA
**Estado:** 5 áreas cerradas · 77 roles · 169+ decisiones

## PARTE 1 — GM-0: VISIÓN Y GLOSARIO
- **D-002:** Perfecto = no frena operación + configurable + no pierde plata.
- **D-005:** 5 principios rectores (offline-first, configuración sobre código, velocidad, trazabilidad, definición única).
- **D-007:** Glosario canónico (insumo, producto, preparación, receta, ficha de costo, merma, comanda, cubierto, turno, arqueo, depósito, lote, canal, modificador, combo).

## PARTE 3 — MODELO DE DOMINIO
### ÁREA 1 — EMPRESA
- **D-019 a D-030:** Empresa, Establecimiento, Jerarquía, Usuario, Acceso, Rol, Permiso, Suplencia, Período de confianza.
- **D-027 (Permisos):** 7 acciones, 6 alcances, 6 datos sensibles.

### ÁREA 2 — CATÁLOGO
- **D-092 a D-103:** Insumo, Producto, Preparación, Receta, Ficha de costo, Precio, Modificador, Combo, Categoría, Menú, Lista de precios, Promoción.

### ÁREA 3 — STOCK
- **D-104 a D-118:** Depósito, Ubicación, Lote, Movimiento, Ajuste, Merma, Transferencia, Proveedor, Orden de compra, Recepción, Cuenta por pagar, Orden de producción, Plan, Forecast.

### ÁREA 4 — VENTAS
- **D-119 a D-131:** Pedido, Comanda, Cuenta, Mesa, Cobro, Medio de pago, Propina, Turno de caja, Arqueo, Canal, KDS, Reserva.

### ÁREA 5 — PERSONAS
- **D-132 a D-140:** Cliente, Historial, Fidelización, Cuenta corriente, Empleado, Turno, Fichaje, Liquidación de propinas.

## PARTE 5 — MARCO DE PERMISOS
- **7 acciones:** ver, crear, editar, anular, aprobar, exportar, configurar.
- **6 alcances:** propio, equipo, sector, establecimiento, empresa, grupo.
- **6 sensibles:** costos_margenes, datos_personales, datos_fiscales, propinas_liquidaciones, descuentos_anulaciones, config_permisos.

## PARTE 10 — SECCIONES GM (1 a 29)
- **GM-1:** UI de roles y permisos.
- **GM-3:** POS, mesas, comandas.
- **GM-4:** Catálogo y precios.
- **GM-5:** KDS (Cocina).
- **GM-6:** Cobros y facturación.
- **GM-7:** Caja y arqueo.
- **GM-8:** Delivery.
- **GM-9:** Reservas.
- **GM-10:** Inventario.
- **GM-11:** Costos.
- **GM-12:** Compras.
- **GM-13:** Producción.
- **GM-14:** RRHH.
- **GM-15:** Contabilidad.
- **GM-16:** CRM.
- **GM-17:** Reportes.
- **GM-18:** Multi-sucursal.
- **GM-19:** Seguridad.
- **GM-20:** Integraciones.
- **GM-21:** Requisitos no funcionales.
- **GM-22:** Fiscalidad.
- **GM-22b:** Legal.
- **GM-23:** Onboarding.
- **GM-24:** Negocio y pricing.
- **GM-25:** Inocuidad.
- **GM-26:** Workflows.
- **GM-27:** Canales digitales.
- **GM-28:** Eventos.
- **GM-29:** Cuentas corrientes y gift cards.
