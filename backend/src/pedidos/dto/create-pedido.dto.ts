import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, Min, ValidateNested } from 'class-validator';

export class CreatePedidoDetalleDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsOptional()
  notas?: string;
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
  estado?: string;

  @IsString()
  @IsOptional()
  estadoCocina?: string;

  @IsString()
  @IsOptional()
  metodoPago?: string;

  @IsString()
  @IsOptional()
  direccionEntrega?: string;

  @IsNumber()
  @IsOptional()
  costoEnvio?: number;

  @IsString()
  @IsOptional()
  tipoFactura?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11, { message: 'El CUIT debe tener exactamente 11 dígitos' })
  cuitFactura?: string;

  @IsString()
  @IsOptional()
  razonSocialFactura?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoDetalleDto)
  detalles: CreatePedidoDetalleDto[];
}