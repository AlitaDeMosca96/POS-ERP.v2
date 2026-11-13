import { PartialType } from '@nestjs/mapped-types';
import { CreateModificadoreDto } from './create-modificadore.dto';

export class UpdateModificadoreDto extends PartialType(CreateModificadoreDto) {}
