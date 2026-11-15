import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Rol } from '../enums/rol.enum'; // <-- IMPORTAMOS EL ENUM

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(Rol) // <-- VALIDAMOS QUE SEA UN ROL VÁLIDO
  @IsOptional()
  rol?: Rol;

  @IsUUID()
  @IsOptional()
  empresaId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;
}