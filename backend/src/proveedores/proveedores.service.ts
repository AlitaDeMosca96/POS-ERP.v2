import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedore } from './entities/proveedore.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedore)
    private readonly proveedorRepository: Repository<Proveedore>,
  ) {}

  create(createProveedoreDto: CreateProveedoreDto) {
    const proveedor = this.proveedorRepository.create(createProveedoreDto);
    return this.proveedorRepository.save(proveedor);
  }

  findAll(empresaId: string) {
    return this.proveedorRepository.find({ where: { empresaId }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string, empresaId: string) {
    const prov = await this.proveedorRepository.findOneBy({ id, empresaId });
    if (!prov) throw new NotFoundException('Proveedor no encontrado');
    return prov;
  }

  async update(id: string, updateProveedoreDto: UpdateProveedoreDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.proveedorRepository.update(id, updateProveedoreDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.proveedorRepository.softDelete(id); // <-- SOFT DELETE
  }
}