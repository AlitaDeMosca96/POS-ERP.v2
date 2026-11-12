import { Injectable } from '@nestjs/common';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from './entities/insumo.entity';

@Injectable()
export class InsumosService {
  constructor(
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
  ) {}

  create(createInsumoDto: CreateInsumoDto) {
    const insumo = this.insumoRepository.create(createInsumoDto);
    return this.insumoRepository.save(insumo);
  }

  findAll(empresaId: string) {
    return this.insumoRepository.find({ 
      where: { empresaId },
      order: { nombre: 'ASC' }
    });
  }

  findOne(id: string) {
    return this.insumoRepository.findOneBy({ id });
  }

  update(id: string, updateInsumoDto: UpdateInsumoDto) {
    return this.insumoRepository.update(id, updateInsumoDto);
  }

  remove(id: string) {
    return this.insumoRepository.delete(id);
  }
}