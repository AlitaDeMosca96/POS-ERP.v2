import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateCampaniaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  asunto: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsUUID()
  empresaId: string;
}