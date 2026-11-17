import { IsString, IsNotEmpty, IsNumber, IsInt, Min, MaxLength } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsNumber()
  @Min(0)
  precioMensual: number;

  @IsInt()
  @Min(1)
  limiteSucursales: number;

  @IsInt()
  @Min(1)
  limiteUsuarios: number;
}