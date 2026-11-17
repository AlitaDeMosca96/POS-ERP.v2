import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(
  OmitType(CreateCategoriaDto, ['empresaId'] as const),
) {}