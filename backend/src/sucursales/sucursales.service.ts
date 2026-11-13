import { Injectable } from '@nestjs/common';
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

  findOne(id: string) {
    return this.sucursalRepository.findOne({ 
      where: { id },
      relations: { empresa: true }
    });
  }

  update(id: string, updateSucursalDto: UpdateSucursalDto) {
    return this.sucursalRepository.update(id, updateSucursalDto);
  }

  remove(id: string) {
    return this.sucursalRepository.delete(id);
  }
}