export class CreatePedidoDetalleDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  notas?: string; // <-- NUEVO
}

export class CreatePedidoDto {
  pedidoId?: string;
  total: number;
  empresaId: string;
  mesaId?: string;
  estado?: string;
  estadoCocina?: string;
  metodoPago?: string;
  detalles: CreatePedidoDetalleDto[];
}