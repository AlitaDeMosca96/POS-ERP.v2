## Módulo POS y Salón (Bloque 2)

### Pantalla Principal del POS
- **Vista Híbrida**: Salón dividido por zonas (Salón, Barra, Terraza, Delivery).
- **Grilla visual de mesas**: Dentro de cada zona, las mesas muestran su estado (libre, ocupada, por cobrar, demorada).
- **Accesos directos**: Botones fijos para Mostrador, Pedidos Telefónicos y Pedidos de Kiosco/QR.

### Navegación del Catálogo en POS
- **Categorías**: Botones grandes y accesibles.
- **Buscador rápido**: Campo de texto fijo en pantalla para buscar por nombre o código.
- **Favoritos / Top Ventas**: Accesos directos a los productos más pedidos del turno o favoritos del local.

### Modificadores de Productos
- **Opciones predefinidas**: Botones configurables por producto (ej. punto de carne, aderezos, guarniciones).
- **Texto libre**: Campo para notas específicas del cliente (ej. "sin hielo", "para llevar").
- **Reglas de obligatoriedad**: El sistema bloquea el envío si el producto requiere una selección obligatoria (ej. elegir guarnición).
- **Multi-selección**: Permite elegir varios modificadores a la vez (ej. "sin cebolla" + "con queso extra").

### Ruteo de Pedidos (Cocina y Barra)
- **Configuración flexible**: Cada estación (Cocina, Barra, Postres) se configura para imprimir en térmica, mostrar en pantalla KDS, o ambas.
- **Impresión por categoría**: Los productos se rutean automáticamente a la impresora/pantalla correspondiente según su categoría.

### KDS (Pantalla de Cocina) y Manejo de Tiempos
- **Tildado flexible**: El cocinero puede marcar ítems individuales como "Listos" o la mesa completa de un toque.
- **Manejo de Courses (Tiempos)**: Los platos se agrupan por tiempos (Entrada, Principal, Postre). Cocina no ve el principal hasta que el salón lo "dispara" (o por timer automático).
- **Comunicación bidireccional**: 
  - Salón -> Cocina: "Largar mesa 4".
  - Cocina -> Salón: Alerta visual/sonora de "Mesa 4 lista para retirar".
- **Priorización**: El cocinero puede reordenar los pedidos en pantalla según urgencia.

### Cobro (Pagos y Facturación)
- **Pago mixto (Split Payment)**: Un mismo ticket puede pagarse con múltiples medios (efectivo + tarjeta + QR) en una sola operación.
- **División de cuenta (Split Bill)**: Posibilidad de dividir la cuenta por ítem, por personas o por montos iguales.
- **Facturación separada**: Capacidad de generar múltiples comprobantes fiscales para un mismo pedido (ej. dos empresas pagan la misma mesa y necesitan facturas distintas).

### Anulaciones, Descuentos y Autorizaciones
- **Control estricto**: Anulaciones de platos ya preparados o descuentos requieren autorización.
- **Autorización en pantalla**: El sistema despliega un modal que exige el PIN, tarjeta o huella de un superior (Gerente/Dueño).
- **Trazabilidad**: Queda registrado en la auditoría quién intentó anular/descontar y quién lo autorizó.

### Flujo de Cobro (Salón vs Caja)
- **Configurable por local**: El dueño define si los mozos pueden cobrar y cerrar mesas en el momento, o si el cliente debe pasar por caja central.
- **Handhelds**: Si se permite cobro en mesa, el sistema soporta terminales móviles y posnets integrados.
- **Control de efectivo**: El sistema registra en qué terminal/usuario se cobró cada mesa.

### Cierre de Caja y Arqueos
- **Arqueo Simple**: El sistema muestra el efectivo esperado y el cajero ingresa el conteo real (útil para locales con personal de confianza).
- **Arqueo Ciego (Configurable)**: Oculta el monto esperado hasta que el cajero ingresa su conteo, para evitar fraudes.
- **Cierre de Turno**: Registra retiros, ingresos (sangrías), propinas y calcula automáticamente faltantes o sobrantes.

### Gestión de Propinas en el Cobro
- **Botones rápidos**: Porcentajes predefinidos (10%, 15%, 20%) y opción de monto manual.
- **Integración con Posnet**: Recepción automática del monto de propina cargado en la terminal de pago (si el hardware lo soporta).
- **Asignación**: La propina se registra vinculada al mozo y al turno para su posterior liquidación.

### Apertura de Cajón sin Venta ("No Sale")
- **Registro obligatorio**: Cada apertura sin venta queda registrada en la auditoría (usuario, hora y motivo).
- **Configurable**: El dueño puede definir si requiere autorización con PIN de superior o si es libre con registro.
- **Alertas**: El sistema puede notificar al dueño si hay un volumen anormal de aperturas "No Sale" en un turno.

### Venta por Peso y Granel
- **Integración con Balanza**: Comunicación directa con balanzas (serial/USB) para capturar el peso automáticamente.
- **Etiquetas con Código de Barras**: Lectura de etiquetas generadas por balanzas externas (típico en autoservicio).
- **Ingreso Manual**: Opción de teclear el peso o monto directamente en el POS como fallback.
- **Unidades de medida**: Soporte para kg, gramos, litros, unidades.

### Modo Kiosco / Autoservicio (Pago)
- **Configurable**: El local define si el kiosco cobra directo o si el cliente paga en caja.
- **Pago en Kiosco**: Integración con pasarelas/tarjetas/QR. Una vez pagado, el pedido salta directo a cocina.
- **Pago en Caja**: El kiosco imprime un ticket con número de orden; el cliente paga en la caja central y el sistema recién ahí envía la comanda a cocina.

### Modo Kiosco / Autoservicio (Pago)
- **Configurable**: El local define si el kiosco cobra directo o si el cliente paga en caja.
- **Pago en Kiosco**: Integración con pasarelas/tarjetas/QR. Una vez pagado, el pedido salta directo a cocina.
- **Pago en Caja**: El kiosco imprime un ticket con número de orden; el cliente paga en la caja central y el sistema recién ahí envía la comanda a cocina.

### Consumo del Personal (Meal Comp)
- **Políticas configurables**: El dueño define las reglas según el rol, turno o tipo de empleado (Gratis, descuento parcial, o cargo a cuenta).
- **Cargo a sueldo**: Si se descuenta, se integra con el módulo de RRHH para la liquidación de haberes.
- **Control de stock**: Todo consumo de personal impacta en el inventario y costos del local.

### Unión y Transferencia de Mesas
- **Unión (Merge)**: Agrupa varias mesas en una sola cuenta maestra.
- **División con origen**: Mantiene el registro de qué plato se pidió en cada mesa física antes de unirlas.
- **Transferencia total**: Mueve toda la cuenta de una mesa a otra.
- **Transferencia parcial**: Mueve ítems específicos de una mesa a otra.
- **Cambio de mozo**: Permite transferir una mesa de un mozo a otro (ej. cambio de turno).

### Reapertura de Cuentas
- **Configurable**: El local define si reabrir una mesa con pre-cuenta impresa requiere autorización.
- **Opciones**: Puede ser libre (con registro de auditoría) o requerir PIN de superior.
- **Registro**: Todo ítem agregado post pre-cuenta queda marcado en el historial del pedido.

### Modo Entrenamiento (Training Mode)
- **Simulación aislada**: Permite operar el POS (tomar pedidos, cobrar, imprimir) sin afectar caja real, stock ni contabilidad.
- **Identificación visual**: La interfaz y los tickets impresos llevan una marca clara de "ENTRENAMIENTO".
- **Control**: Se activa por usuario y queda registrado en auditoría.

