import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePedidoDto } from './create-pedido.dto';

export class UpdatePedidoDto extends PartialType(
  OmitType(CreatePedidoDto, ['detalles', 'pedidoId'] as const)
) {
  estadoDelivery?: string;
}