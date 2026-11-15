import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCuit } from '../../common/validators/is-cuit.validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsOptional()
  @IsCuit({ message: 'El CUIT debe tener 11 dígitos y un dígito verificador válido' })
  cuit?: string;

  @IsString()
  @IsOptional()
  monedaBase?: string;
}