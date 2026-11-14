import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMesaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @Min(1)
  capacidad: number;

  @IsUUID()
  @IsOptional()
  empresaId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;
}