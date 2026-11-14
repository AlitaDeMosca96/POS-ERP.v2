import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.insumoRepository.find({ where: { empresaId }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string, empresaId: string) {
    const insumo = await this.insumoRepository.findOneBy({ id, empresaId });
    if (!insumo) throw new NotFoundException('Insumo no encontrado');
    return insumo;
  }

  async update(id: string, updateInsumoDto: UpdateInsumoDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.insumoRepository.update(id, updateInsumoDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.insumoRepository.softDelete(id); // <-- SOFT DELETE
  }
}