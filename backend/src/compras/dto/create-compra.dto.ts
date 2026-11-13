export class CreateCompraDetalleDto {
  insumoId: string;
  cantidad: number;
  costoUnitario: number;
}

export class CreateCompraDto {
  total: number;
  empresaId: string;
  proveedorId: string;
  detalles: CreateCompraDetalleDto[];
}