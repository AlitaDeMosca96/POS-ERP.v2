import { Injectable } from '@nestjs/common';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa } from './entities/mesa.entity';

@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
  ) {}

  create(createMesaDto: CreateMesaDto) {
    const mesa = this.mesaRepository.create(createMesaDto);
    return this.mesaRepository.save(mesa);
  }

  findAll(empresaId: string) {
    return this.mesaRepository.find({ where: { empresaId } });
  }

  findOne(id: string) {
    return this.mesaRepository.findOneBy({ id });
  }

  update(id: string, updateMesaDto: UpdateMesaDto) {
    return this.mesaRepository.update(id, updateMesaDto);
  }

  remove(id: string) {
    return this.mesaRepository.delete(id);
  }
}