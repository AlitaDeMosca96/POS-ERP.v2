export class CreatePedidoDetalleDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export class CreatePedidoDto {
  pedidoId?: string;
  total: number;
  empresaId: string;
  mesaId?: string;
  estado?: string;
  estadoCocina?: string; // <-- NUEVO
  detalles: CreatePedidoDetalleDto[];
}