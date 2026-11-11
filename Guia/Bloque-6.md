## Módulo Fiscal Multi-país (Bloque 6)

### Puntos de Venta y Numeración
- **Configurable**: Permite asignar un punto de venta por sucursal o por terminal POS específica, gestionando secuencias numéricas independientes.

### Contingencia Fiscal y Facturación Offline
- **Configurable**: Permite definir el comportamiento ante caída de internet.
- **Modo Contingencia (Recomendado)**: Emite el ticket, lo guarda localmente y lo transmite al ente fiscal automáticamente al reconectar (si la ley local lo permite).
- **Modo Estricto**: Bloquea la emisión si no hay conexión.
- **Comprobantes manuales**: Opción de emitir documentos no fiscales para regularizar luego.

### Tipos de Comprobantes y Condición Fiscal
- **Híbrido**: Emisión por defecto de Consumidor Final (Factura B).
- **Validación automática**: Si se ingresa un CUIT/DNI, el sistema consulta la condición fiscal del cliente y emite el comprobante correspondiente (Factura A, B, C o equivalente en otros países) sin intervención manual.

### Motor de Impuestos Global
- **Configurable**: Permite forzar alícuotas manuales o dejar que un motor de reglas geográfico aplique IVA, VAT o Sales Tax automáticamente según el país, estado/provincia y tipo de producto.

### Libros Fiscales y Reportes Legales
- **Configurable**: Genera reportes estándar (Excel/PDF) y utiliza un motor de plantillas para exportar archivos con el formato exacto que exija el ente recaudador de cada país (ej. Libro IVA Digital).

### Gestión de Certificados Digitales
- **Delegación en Proveedor Externo**: La gestión técnica del certificado (alta, renovación, firma) recae en el proveedor homologado de facturación.
- **Monitoreo y Alertas**: El sistema consulta el estado del certificado y notifica al cliente (ej. 30 días antes) si está por vencer, ofreciendo un acceso directo para renovarlo.

