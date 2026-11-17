import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, Min, IsBoolean } from 'class-validator';

export class CreateInsumoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsOptional()
  unidadMedida?: string;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  @IsOptional()
  stock?: number;

  @IsNumber()
  @Min(0, { message: 'El costo no puede ser negativo' })
  @IsOptional()
  costo?: number;

  @IsBoolean()
  @IsOptional()
  controlaStock?: boolean;

  @IsUUID()
  @IsOptional()
  empresaId?: string;
}