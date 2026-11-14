export class CreatePedidoDetalleDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
}

export class CreatePedidoDto {
  pedidoId?: string;
  total: number;
  empresaId: string;
  sucursalId?: string; // <-- NUEVO
  mesaId?: string;
  clienteId?: string;
  estado?: string;
  estadoCocina?: string;
  metodoPago?: string;
  detalles: CreatePedidoDetalleDto[];
}