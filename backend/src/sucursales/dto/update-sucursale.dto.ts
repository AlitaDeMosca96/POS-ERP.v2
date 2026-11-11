import { PartialType } from '@nestjs/mapped-types';
import { CreateSucursalDto } from './create-sucursale.dto';

export class UpdateSucursalDto extends PartialType(CreateSucursalDto) {}