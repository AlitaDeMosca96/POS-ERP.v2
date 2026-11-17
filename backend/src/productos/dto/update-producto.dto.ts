import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductoDto extends PartialType(OmitType(CreateProductoDto, ['empresaId'] as const)) {
  @IsString()
  @IsOptional()
  motivoAjuste?: string;
}