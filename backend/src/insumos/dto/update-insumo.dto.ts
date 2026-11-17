import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateInsumoDto } from './create-insumo.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInsumoDto extends PartialType(OmitType(CreateInsumoDto, ['empresaId'] as const)) {
  @IsString()
  @IsOptional()
  motivoAjuste?: string;
}