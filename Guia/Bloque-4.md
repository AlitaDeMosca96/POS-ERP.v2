## Módulo Compras y Proveedores (Bloque 4)

### Generación de Órdenes de Compra
- **Manual**: El encargado arma la orden seleccionando insumos y cantidades.
- **Sugerida (Automática)**: El sistema genera un borrador basado en los puntos de pedido y forecast, que el humano debe revisar y aprobar.

### Recepción de Mercadería
- **Configurable**: Permite aceptar recepciones parciales (dejando la orden abierta por el saldo pendiente) o exigir la recepción total para cerrar la orden.
- **Control de faltantes**: Registro automático de la diferencia entre lo pedido y lo recibido.

### Control de Calidad en Recepción
- **Configurable por insumo**: Permite exigir controles estrictos (fotos, temperatura, pesaje) para insumos críticos (carnes, lácteos) y controles simples (tildar) para secos o no perecederos.
- **Registro de rechazos**: Permite marcar ítems como rechazados y adjuntar evidencia fotográfica desde el dispositivo (tablet/celular).

### Devoluciones a Proveedores
- **Configurable**: Permite registrar devoluciones mediante un ajuste rápido de stock o generando una Nota de Crédito formal.
- **Impacto financiero**: Si se usa Nota de Crédito, se descuenta automáticamente de la cuenta corriente o factura del proveedor.

### Evaluación de Proveedores (Scorecard)
- **Híbrido**: El sistema calcula métricas automáticas (cumplimiento de plazos, tasa de rechazo, variación de precios) y permite agregar una evaluación cualitativa manual (comentarios/estrellas).
- **Ranking**: Visualización del mejor proveedor por categoría.

### Autorizaciones y Aprobaciones de Compra
- **Configurable (Multinivel)**: El dueño define topes de monto y qué rol debe aprobar cada nivel (ej. encargado hasta X monto, dueño para montos mayores).
- **Flujo de aprobación**: Las órdenes quedan en estado "Borrador" hasta ser aprobadas, sin enviarse al proveedor antes.
- **Trazabilidad**: Registro de quién solicitó y quién aprobó cada compra.

### Pago a Proveedores
- **Gestión manual y Agenda**: Permite registrar pagos a medida que ocurren, y a su vez ofrece un calendario de vencimientos para planificar el flujo de caja.
- **Imputación**: Los pagos se aplican automáticamente a las facturas pendientes (total o parcialmente).

### Compras Consolidadas (Multi-sucursal)
- **Configurable**: Permite un modelo centralizado (la casa matriz compra para todos) o un modelo sugerido (el sistema alerta a la central sobre necesidades cruzadas entre sucursales para negociar en conjunto).
- **Distribución**: Capacidad de dividir la mercadería recibida entre las sucursales que participaron del pedido.

### Costos de Importación (Landed Cost)
- **Configurable**: Permite capitalizar los gastos (flete, aduana, seguro) distribuyéndolos proporcionalmente en el costo de los productos, o registrarlos como gastos generales separados.
- **Multi-moneda**: Cálculo automático usando el tipo de cambio del día de la operación.

### Comparativa de Precios y Cotizaciones
- **Configurable**: Permite consultar el histórico de precios de compras anteriores (por proveedor) o generar un Pedido de Cotización (RFQ) formal para que varios proveedores oferten.
- **Análisis**: El sistema resalta automáticamente la oferta más conveniente (precio, plazo de entrega, condiciones).

### Carga de Facturas de Proveedores
- **Configurable**: Permite la carga manual de datos o la lectura automática mediante OCR/IA (foto o PDF).
- **Validación humana**: Si se usa IA, los datos extraídos (CUIT, importes, ítems) deben ser validados por un usuario antes de impactar en el sistema.

### Solicitudes de Compra (Requisiciones)
- **Configurable**: Permite saltar el flujo formal (cargar la orden directamente) o exigir una Solicitud de Compra interna que deba ser aprobada y convertida en Orden de Compra por el encargado.
- **Notificaciones**: Aviso automático al encargado cuando un área genera una solicitud.

