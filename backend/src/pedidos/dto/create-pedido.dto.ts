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
  mesaId?: string;
  clienteId?: string; // <-- NUEVO
  estado?: string;
  estadoCocina?: string;
  metodoPago?: string;
  detalles: CreatePedidoDetalleDto[];
}