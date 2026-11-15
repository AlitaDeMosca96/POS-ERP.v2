import { IsNumber, IsString, IsIn, Min } from 'class-validator';

export class CreateMovimientoDto {
  @IsString()
  @IsIn(['INGRESO', 'EGRESO'], { message: 'El tipo debe ser INGRESO o EGRESO' })
  tipo: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsString()
  motivo: string;
}