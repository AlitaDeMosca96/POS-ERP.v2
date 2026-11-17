import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested, IsIn } from 'class-validator';
import { IsCuit } from '../../common/validators/is-cuit.validator';

export class CreatePedidoDetalleDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  modificadoresIds?: string[];
}

export class CreatePedidoDto {
  @IsUUID()
  @IsOptional()
  pedidoId?: string;

  @IsUUID()
  @IsOptional()
  empresaId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;

  @IsUUID()
  @IsOptional()
  mesaId?: string;

  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ABIERTO', 'PAGADO'], { message: 'Estado inválido. Para anular use el endpoint dedicado.' })
  estado?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'], { message: 'Estado de cocina inválido' })
  estadoCocina?: string;

  @IsString()
  @IsOptional()
  @IsIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MERCADO_PAGO', 'PENDIENTE'], { message: 'Método de pago inválido' })
  metodoPago?: string;

  @IsString()
  @IsOptional()
  direccionEntrega?: string;

  @IsNumber()
  @Min(0, { message: 'El costo de envío no puede ser negativo' })
  @IsOptional()
  costoEnvio?: number;

  @IsString()
  @IsOptional()
  @IsIn(['FACTURA_A', 'FACTURA_B', 'FACTURA_C', 'TICKET'], { message: 'Tipo de factura inválido' })
  tipoFactura?: string;

  @IsString()
  @IsOptional()
  @IsCuit({ message: 'El CUIT debe tener 11 dígitos y un dígito verificador válido' })
  cuitFactura?: string;

  @IsString()
  @IsOptional()
  razonSocialFactura?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoDetalleDto)
  detalles: CreatePedidoDetalleDto[];
}