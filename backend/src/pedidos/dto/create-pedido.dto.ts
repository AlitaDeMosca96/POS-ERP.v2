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
  sucursalId?: string;
  mesaId?: string;
  clienteId?: string;
  estado?: string;
  estadoCocina?: string;
  metodoPago?: string;
  direccionEntrega?: string; // <-- NUEVO
  costoEnvio?: number; // <-- NUEVO
  detalles: CreatePedidoDetalleDto[];
}