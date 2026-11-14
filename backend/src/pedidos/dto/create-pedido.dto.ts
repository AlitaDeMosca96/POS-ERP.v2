export class CreatePedidoDetalleDto {
  productoId: string;
  cantidad: number;
  notas?: string;
}

export class CreatePedidoDto {
  pedidoId?: string;
  empresaId: string;
  sucursalId?: string;
  mesaId?: string;
  clienteId?: string;
  estado?: string;
  estadoCocina?: string;
  metodoPago?: string;
  
  // Delivery
  direccionEntrega?: string;
  costoEnvio?: number;
  
  // Facturación
  tipoFactura?: string;
  cuitFactura?: string;
  razonSocialFactura?: string;
  
  detalles: CreatePedidoDetalleDto[];
}