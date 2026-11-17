import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, IsUUID } from 'class-validator';
import { IsCuit } from '../../common/validators/is-cuit.validator';

export class CrearEmpresaAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  nombre: string;

  @IsString()
  @IsOptional()
  @IsCuit({ message: 'El CUIT debe tener 11 dígitos y un dígito verificador válido' })
  cuit?: string;

  @IsUUID()
  @IsOptional()
  planId?: string;

  // Datos del Administrador
  @IsString()
  @IsNotEmpty({ message: 'El nombre del admin es obligatorio' })
  adminNombre: string;

  @IsEmail({}, { message: 'El email del admin no es válido' })
  adminEmail: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  adminPassword: string;
}