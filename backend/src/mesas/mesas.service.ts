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
    // Si el usuario tiene sucursalId (es cajero/mozo), filtramos solo su local.
    // Si es null (es admin), le mostramos todas las mesas de la empresa.
    const query = sucursalId 
      ? { empresaId, sucursalId } 
      : { empresaId };

    return this.mesaRepository.find({ 
      where: query,
      relations: { sucursal: true }
    });
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