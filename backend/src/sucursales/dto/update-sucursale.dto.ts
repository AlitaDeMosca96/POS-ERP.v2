import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSucursalDto } from './create-sucursale.dto';

export class UpdateSucursalDto extends PartialType(
  OmitType(CreateSucursalDto, ['empresaId'] as const),
) {}