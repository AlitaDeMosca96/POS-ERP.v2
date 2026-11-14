import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsNumber()
  @Min(0)
  costo: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsUUID()
  @IsOptional()
  empresaId?: string;

  @IsUUID()
  @IsOptional()
  categoriaId?: string;
}