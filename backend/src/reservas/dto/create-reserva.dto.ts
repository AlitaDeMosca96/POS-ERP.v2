import { IsInt, IsUUID, IsDateString, Min } from 'class-validator';

export class CreateReservaDto {
  @IsDateString()
  fechaHora: string; // En JSON viaja como string, TypeORM lo convierte a Date después

  @IsInt()
  @Min(1)
  cantidadPersonas: number;

  @IsUUID()
  mesaId: string;

  @IsUUID()
  clienteId: string;

  @IsUUID()
  empresaId: string;
}