import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProveedoreDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsUUID()
  @IsOptional()
  empresaId?: string;
}