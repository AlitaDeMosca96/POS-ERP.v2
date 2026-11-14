import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plane.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}