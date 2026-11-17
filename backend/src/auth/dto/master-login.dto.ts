import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class MasterLoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'El código 2FA debe tener 6 dígitos' })
  code2FA?: string;
}