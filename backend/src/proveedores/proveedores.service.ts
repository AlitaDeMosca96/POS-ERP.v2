import { Injectable } from '@nestjs/common';
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
    return this.proveedorRepository.find({ 
      where: { empresaId },
      order: { nombre: 'ASC' }
    });
  }

  findOne(id: string) {
    return this.proveedorRepository.findOneBy({ id });
  }

  update(id: string, updateProveedoreDto: UpdateProveedoreDto) {
    return this.proveedorRepository.update(id, updateProveedoreDto);
  }

  remove(id: string) {
    return this.proveedorRepository.delete(id);
  }
}