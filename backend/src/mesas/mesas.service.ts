import { Injectable, NotFoundException } from '@nestjs/common';
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
    const mesa = this.mesaRepository.create({
      nombre: createMesaDto.nombre,
      capacidad: createMesaDto.capacidad,
      empresaId: createMesaDto.empresaId,
      sucursalId: createMesaDto.sucursalId || undefined,
      sucursal: createMesaDto.sucursalId ? { id: createMesaDto.sucursalId } : undefined
    });
    return this.mesaRepository.save(mesa);
  }

  findAll(empresaId: string, sucursalId: string | null) {
    const query = sucursalId ? { empresaId, sucursalId } : { empresaId };
    return this.mesaRepository.find({ where: query, relations: { sucursal: true } });
  }

  async findOne(id: string, empresaId: string) {
    const mesa = await this.mesaRepository.findOne({ where: { id, empresaId } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');
    return mesa;
  }

  async update(id: string, updateMesaDto: UpdateMesaDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.mesaRepository.update(id, updateMesaDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.mesaRepository.softDelete(id); // <-- SOFT DELETE
  }
}