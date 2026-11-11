## Módulo Financiero y Contable (Bloque 5)

### Conciliación Bancaria y de Pasarelas
- **Configurable**: Permite conciliación automática vía API (bancos, pasarelas de pago) con validación humana de diferencias, o conciliación 100% manual mediante importación de extractos.
- **Trazabilidad**: Cruce entre el cobro registrado en el POS y el ingreso real en la cuenta bancaria.

### Asientos Contables Manuales
- **Configurable**: Permite habilitar o bloquear la creación de asientos manuales por parte del contador.
- **Validación de partida doble**: El sistema no permite guardar un asiento si el Debe y el Haber no cuadran.
- **Auditoría**: Todo asiento manual requiere un motivo y queda registrado con el usuario que lo creó.

### Flujo de Caja (Cash Flow)
- **Configurable**: Permite visualizar el saldo actual consolidado (cajas y bancos) y/u obtener proyecciones futuras basadas en cuentas por cobrar, cuentas por pagar y ventas estimadas.
- **Consolidación**: Visión unificada de todas las sucursales y empresas en la moneda base.

### Diferencia de Cambio y Revaluación
- **Configurable**: Permite calcular el impacto cambiario al momento del pago (flujo de caja real) o realizar revaluaciones mensuales de saldos en moneda extranjera (ajuste contable por inflación/devaluación).

### Cierre de Períodos y Bloqueo Contable
- **Configurable**: Permite configurar un bloqueo total (duro) o un bloqueo con autorización (que permite reabrir períodos cerrados con trazabilidad y justificación).
- **Auditoría**: Registro inmutable de quién solicitó y quién autorizó la reapertura de un período.

### Centros de Costos
- **Configurable**: Permite operar de forma consolidada por sucursal o habilitar centros de costos (Cocina, Barra, Salón, Administración) para asignar ingresos y gastos por sector.

### Control Presupuestario
- **Configurable**: Permite definir si el sistema solo alerta (informativo) o si bloquea las operaciones (ej. compras) cuando se supera el presupuesto asignado.
- **Gestión de excedentes**: Flujo de aprobación para autorizar un gasto por encima del límite.

### Operaciones Intercompany (Entre Empresas del Grupo)
- **Configurable**: Permite realizar traslados internos sin facturación fiscal (solo movimiento de stock y costos) o emitir facturas fiscales reales entre empresas del grupo para mantener contabilidades independientes.
- **Consolidación**: Al cierre, el sistema elimina automáticamente las operaciones internas para que no inflen los ingresos totales del grupo.

### Gestión de Cheques
- **Configurable**: Permite un registro básico (solo como medio de pago) o habilitar un módulo completo de cartera de cheques (físicos y electrónicos) con control de vencimientos, depósitos, endosos y rechazos.

### Retenciones y Percepciones
- **Configurable**: Permite configurar reglas automáticas por jurisdicción y condición fiscal (CUIT), o realizar el cálculo e ingreso manual para casos especiales.

