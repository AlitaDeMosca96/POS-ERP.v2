import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}