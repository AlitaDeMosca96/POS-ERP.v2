import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  empresaId?: string;
}