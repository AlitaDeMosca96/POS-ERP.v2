## Facturación simulada

El campo `Pedido.caeSimulado` y el `numeroComprobante` (formato `PV-0001-XXXXXXXX`) son **simulados**. No tienen validez fiscal ante AFIP/ARCA.

Restricciones operativas:
- No imprimir el `caeSimulado` en comprobantes presentados al cliente como factura.
- No usar `numeroComprobante` como comprobante legal.
- Para facturación real, integrar un proveedor de facturación electrónica (AFIP WSFE / ARCA) antes de emitir comprobantes con validez legal.

El secuencial por `tipoFactura` se calcula sobre el último pedido del mismo tipo en la empresa. No es atómico ante concurrencia: dos pedidos simultáneos pueden colisionar en el número. Aceptable para simulación, no para producción fiscal.