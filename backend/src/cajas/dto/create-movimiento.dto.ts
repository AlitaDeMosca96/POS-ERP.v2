import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateMovimientoDto {
  @IsString()
  tipo: string; // INGRESO o SANGRIA

  @IsNumber()
  @Min(0.01)
  monto: number;

  @IsString()
  motivo: string;

  @IsUUID()
  cajaId: string;
}