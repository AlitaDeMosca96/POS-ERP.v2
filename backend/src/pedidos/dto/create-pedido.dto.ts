export class CreatePedidoDetalleDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export class CreatePedidoDto {
  total: number;
  empresaId: string;
  detalles: CreatePedidoDetalleDto[];
}