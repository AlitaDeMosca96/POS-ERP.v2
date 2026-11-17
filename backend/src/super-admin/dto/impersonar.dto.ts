import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ImpersonarDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres' })
  motivo: string;
}