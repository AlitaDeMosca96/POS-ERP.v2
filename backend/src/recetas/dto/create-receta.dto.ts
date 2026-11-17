import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateRecetaDto {
  @IsUUID()
  productoId: string;

  @IsUUID()
  insumoId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;
}