import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReservaDto } from './create-reserva.dto';

export class UpdateReservaDto extends PartialType(
  OmitType(CreateReservaDto, ['empresaId'] as const),
) {}