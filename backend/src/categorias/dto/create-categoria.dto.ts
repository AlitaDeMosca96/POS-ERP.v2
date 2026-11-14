import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsUUID()
  @IsOptional()
  empresaId?: string;
}