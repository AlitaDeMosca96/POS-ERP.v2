export class CreatePedidoDetalleDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export class CreatePedidoDto {
  pedidoId?: string; // <-- Nuevo
  total: number;
  empresaId: string;
  mesaId?: string;
  estado?: string;
  detalles: CreatePedidoDetalleDto[];
}