import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateInsumoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  costo: number;

  @IsUUID()
  @IsOptional()
  empresaId?: string;
}