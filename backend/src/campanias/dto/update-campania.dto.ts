import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCampaniaDto } from './create-campania.dto';

export class UpdateCampaniaDto extends PartialType(
  OmitType(CreateCampaniaDto, ['empresaId'] as const),
) {}