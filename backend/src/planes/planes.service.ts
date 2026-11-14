import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plane.dto';
import { UpdatePlanDto } from './dto/update-plane.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plane.entity';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  create(createPlanDto: CreatePlanDto) {
    const plan = this.planRepository.create(createPlanDto);
    return this.planRepository.save(plan);
  }

  findAll() {
    return this.planRepository.find({ order: { precioMensual: 'ASC' } });
  }

  findOne(id: string) {
    return this.planRepository.findOneBy({ id });
  }

  update(id: string, updatePlanDto: UpdatePlanDto) {
    return this.planRepository.update(id, updatePlanDto);
  }

  remove(id: string) {
    return this.planRepository.delete(id);
  }
}