import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Rol } from '../enums/rol.enum';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(Rol)
  @IsOptional()
  rol?: Rol;

  @IsUUID()
  @IsOptional()
  empresaId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;
}