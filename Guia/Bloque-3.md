## Módulo Catálogo e Inventario (Bloque 3)

### Estructura del Catálogo
- **Árbol de Categorías Jerárquico**: Permite crear categorías y subcategorías ilimitadas (ej. Bebidas > Vinos > Tintos).
- **Etiquetas (Tags)**: Clasificación transversal por atributos (ej. "Sin TACC", "Vegano", "Promo", "Estacional").
- **Híbrido**: Navegación principal por árbol de categorías y filtrado rápido por etiquetas.

### Variantes de Productos
- **Configurable por producto**: El dueño elige si usarlo como un producto único con variantes (ej. Pizza -> Chica/Grande) o crear productos independientes (ej. Pizza Chica).
- **Impacto en inventario**: Las variantes pueden compartir receta base o tener consumos de stock distintos según configuración.

### Combos y Menús
- **Combos Fijos**: Productos prearmados sin opción a cambios (ej. "Combo 1").
- **Combos Armables**: El cliente elige opciones dentro de categorías (ej. elige 1 plato principal + 1 bebida).
- **Impacto en inventario**: El sistema descuenta automáticamente el stock de todos los ítems que componen el combo.

### Valuación de Costos de Insumos
- **Método Configurable**: El sistema permite elegir el método de valuación a nivel empresa o por insumo (Último costo, Costo Promedio Ponderado, FIFO).
- **Actualización dinámica**: El costo del plato se recalcula automáticamente al cambiar el costo del insumo.

### Rendimiento y Merma (Yield)
- **Configurable**: Permite usar porcentajes de rendimiento simples para insumos directos, o sub-recetas para procesos de desposte/producción complejos.
- **Cálculo automático**: El sistema ajusta el consumo de stock según el rendimiento configurado para calcular el costo real.

### Ubicaciones de Stock
- **Configurable**: Permite operar con stock global unificado (ideal para locales chicos) o habilitar múltiples depósitos y ubicaciones (Cocina, Barra, Cámara, Depósito).
- **Transferencias internas**: Movimiento de mercadería entre ubicaciones con trazabilidad de quién lo hizo.

### Trazabilidad de Lotes y Vencimientos
- **Configurable**: Permite elegir entre salida automática FEFO (First Expired, First Out) o selección manual/escaneo del lote físico por parte del operario.
- **Control estricto**: Bloqueo automático de venta o uso de insumos vencidos.
- **Alertas proactivas**: Notificaciones previas al vencimiento para evitar mermas.

### Toma de Inventario (Conteo Físico)
- **Configurable**: Permite alternar entre conteo ciego (para evitar fraudes), conteo abierto (para agilizar) o conteo por ciclos (sin detener la operación diaria).
- **Soporte handheld**: Conteo ágil mediante escaneo de códigos de barras desde tablets o celulares.
- **Registro de quién contó**: Trazabilidad del usuario que realizó la toma física.

### Ajustes de Inventario
- **Configurable**: Permite ajustes directos o restringidos (con exigencia de motivo y PIN de superior).
- **Trazabilidad**: Todos los ajustes quedan en el registro de auditoría con usuario, fecha y causa.
- **Impacto en costos**: Los ajustes por rotura o merma se reflejan automáticamente en los reportes de pérdida.

### Puntos de Pedido y Alertas de Stock
- **Configurable**: Permite definir stocks mínimos estáticos (fijos) o dinámicos (calculados por el sistema según el historial de ventas).
- **Alertas automáticas**: Generación de notificaciones cuando un insumo cae por debajo del mínimo.

### Registro de Mermas y Desperdicios
- **Omnicanal**: Registro desde el POS, pantalla KDS o app móvil/tablet.
- **Motivos predefinidos**: Clasificación de la merma (vencimiento, error de cocción, rotura, devolución).
- **Costeo automático**: La merma se valoriza al costo actual del insumo y se refleja en los reportes de pérdida.

### Venta sin Stock (Stock Negativo)
- **Configurable**: El dueño define si el sistema bloquea la venta por falta de stock o permite continuar generando stock negativo para regularizar luego.
- **Control**: El stock negativo genera una alerta inmediata en el panel del administrador para auditar el descuadre.

### Producción Interna
- **Configurable**: Permite registrar producción de forma manual (solo sumar el producto terminado) o mediante Órdenes de Producción formales (descuenta insumos automáticamente y suma el resultante).
- **Costeo de producción**: Calcula el costo real del producto terminado en base a los insumos consumidos.
- **Planificación**: Permite programar la producción para turnos futuros.

### Traspaso de Stock entre Sucursales
- **Configurable**: Permite traspasos inmediatos o en tránsito (requiere confirmación de recepción en el destino).
- **Trazabilidad**: Registro del remitente, transportista (si aplica) y receptor.

### Stock en Consignación
- **Control físico**: Registro de mercadería de terceros en el local, o propia en local ajeno.
- **Liquidación configurable**: El dueño elige si el sistema genera automáticamente la cuenta por pagar al proveedor por lo vendido, o si solo lleva el control físico.

