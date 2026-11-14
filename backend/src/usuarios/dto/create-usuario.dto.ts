import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  rol?: string;

  @IsUUID()
  @IsOptional()
  empresaId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;
}