import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursale.dto';
import { UpdateSucursalDto } from './dto/update-sucursale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from './entities/sucursal.entity';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  create(createSucursalDto: CreateSucursalDto) {
    const sucursal = this.sucursalRepository.create(createSucursalDto);
    return this.sucursalRepository.save(sucursal);
  }

  findAll(empresaId: string) {
    return this.sucursalRepository.find({ where: { empresaId } });
  }

  async findOne(id: string, empresaId: string) {
    const sucursal = await this.sucursalRepository.findOne({ 
      where: { id, empresaId },
      relations: { empresa: true }
    });
    if (!sucursal) throw new NotFoundException('Sucursal no encontrada');
    return sucursal;
  }

  async update(id: string, updateSucursalDto: UpdateSucursalDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.sucursalRepository.update(id, updateSucursalDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.sucursalRepository.softDelete(id); // <-- SOFT DELETE
  }
}