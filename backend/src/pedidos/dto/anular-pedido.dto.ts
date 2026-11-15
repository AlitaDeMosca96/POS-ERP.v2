import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AnularPedidoDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo de anulación es obligatorio' })
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres' })
  motivo: string;
}