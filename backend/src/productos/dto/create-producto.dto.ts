import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, Min, IsBoolean } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio: number;

  @IsNumber()
  @Min(0, { message: 'El costo no puede ser negativo' })
  costo: number;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  controlaStock?: boolean;

  @IsUUID()
  @IsOptional()
  categoriaId?: string;

  @IsUUID()
  @IsOptional()
  empresaId?: string;
}