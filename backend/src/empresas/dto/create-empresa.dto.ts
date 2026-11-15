import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsOptional()
  cuit?: string;

  @IsString()
  @IsOptional()
  monedaBase?: string;
}