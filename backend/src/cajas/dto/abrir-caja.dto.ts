import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class AbrirCajaDto {
  @IsNumber()
  @Min(0)
  montoInicial: number;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;
}