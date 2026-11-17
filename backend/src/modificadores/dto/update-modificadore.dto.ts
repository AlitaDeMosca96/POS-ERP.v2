import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateModificadoreDto } from './create-modificadore.dto';

export class UpdateModificadoreDto extends PartialType(
  OmitType(CreateModificadoreDto, ['productoId'] as const),
) {}