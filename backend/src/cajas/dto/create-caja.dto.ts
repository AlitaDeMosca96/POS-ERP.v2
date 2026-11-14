import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateCajaDto {
  @IsNumber()
  @Min(0)
  saldoInicial: number;

  @IsUUID()
  usuarioId: string;

  @IsUUID()
  @IsOptional()
  empresaId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;
}