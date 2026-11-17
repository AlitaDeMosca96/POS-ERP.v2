import { IsString, IsNotEmpty, IsNumber, IsUUID, Min, MaxLength } from 'class-validator';

export class CreateModificadoreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsNumber()
  @Min(0)
  precioExtra: number;

  @IsUUID()
  productoId: string;
}