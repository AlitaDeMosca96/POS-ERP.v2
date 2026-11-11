# Modelo de Datos y Base de Datos (PostgreSQL)

## Entidades Principales (Núcleo)

### 1. Personas y Roles (Party-Role Model)
- **Tabla `Personas`**: Almacena datos base únicos (UUID, Nombre, Apellido, DNI/CUIT, Teléfono, Email, Dirección).
- **Tabla `Clientes`**: Se vincula a `Personas`. Almacena puntos de fidelidad, saldo a favor, etc.
- **Tabla `Empleados`**: Se vincula a `Personas`. Almacena legajo, fecha de ingreso, rol base, sucursal asignada.
- **Tabla `Proveedores`**: Se vincula a `Personas` o a Empresas externas. Almacena condiciones de pago, cuenta corriente.

### 2. Jerarquía Multi-tenant
- **Tabla `Grupos`**: Opcional. Agrupa empresas de un mismo dueño.
- **Tabla `Empresas` (Tenants)**: Almacena CUIT, razón social, moneda base, configuración regional.
- **Tabla `Sucursales`**: Vinculada a Empresas. Almacena dirección, punto de venta, zona horaria.

### 3. Catálogo Maestro (Items)
- **Tabla `Items`**: Registro único para todo (Coca-Cola, Hamburguesa, Pan, Carne). Evita duplicidad.
- **Atributos de Item**: Nombre, SKU, Categoría, Unidad de medida (kg, unidad, litro).
- **Flags (Booleanos)**: 
  - `es_vendible` (Aparece en el POS)
  - `es_comprable` (Se le puede comprar a un proveedor)
  - `es_insumo` (Se usa en recetas)
- **Tabla `Precios`**: Precio de venta del ítem (con historial).
- **Tabla `Costos`**: Costo de compra del ítem (con historial).

### 4. Pedidos y Ventas (POS)
- **Tabla `Pedidos` (Cabecera)**: ID, Sucursal, Mesa, Mozo (Empleado), Fecha/Hora, Estado (Abierto, Cobrado, Anulado), Total.
- **Tabla `Pedido_Detalle` (Snapshot)**: 
  - `item_id` (referencia)
  - `nombre_snapshot` (copia del nombre al momento de la venta)
  - `precio_unitario_snapshot` (precio exacto cobrado)
  - `impuestos_snapshot` (JSON con los impuestos aplicados)
  - `cantidad` y `modificadores` (JSON con las notas, ej. "sin cebolla")

  ### 5. Recetas y Escandallos (Estructura de Árbol)
- **Tabla `Recetas_Componentes`**: 
  - `item_padre_id` (Ej. Hamburguesa)
  - `item_hijo_id` (Ej. Pan, Carne, o Salsa Especial)
  - `cantidad` (Ej. 150 gramos)
- **Anidación**: Permite que un `item_hijo` sea a su vez un `item_padre` de otra receta, creando árboles infinitos de producción.

### 6. Inventario y Stock
- **Tabla `Stock_Actual`**: Columna en la tabla de `Items` que guarda el saldo en tiempo real para consultas rápidas.
- **Tabla `Movimientos_Stock` (Kardex)**: Registro inmutable de cada entrada y salida (venta, compra, merma, ajuste, transferencia) con fecha, usuario, cantidad y costo.

### 7. Caja y Tesorería
- **Tabla `Sesiones_Caja`**: Registra apertura, cierre, usuario, sucursal, saldo inicial y saldo final calculado.
- **Tabla `Movimientos_Caja`**: Detalle de cada ingreso o egreso (Ventas, Sangrías, Gastos, Pagos a proveedores).
- **Nota técnica**: La estructura de base de datos siempre será detallada para auditoría, pero la interfaz de usuario puede simplificarse según la configuración del tenant.

### 8. Comprobantes Fiscales (Inmutables)
- **Tabla `Comprobantes_Fiscales`**: Almacena el tipo de factura, punto de venta, número, CAE/CAI, importes netos, impuestos y estado (Aprobado/Anulado).
- **Inmutabilidad**: Los registros de esta tabla no se pueden editar ni eliminar. Las correcciones se realizan mediante Notas de Crédito vinculadas.
- **Nota**: No es configurable en base de datos por razones legales. La configurabilidad aplica solo a la visibilidad en la interfaz.

