import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePedidoDto {
  @IsString()
  @IsOptional()
  @IsIn(['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'], { message: 'Estado de cocina inválido' })
  estadoCocina?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDIENTE', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'NO_APLICA'], { message: 'Estado de delivery inválido' })
  estadoDelivery?: string;
}