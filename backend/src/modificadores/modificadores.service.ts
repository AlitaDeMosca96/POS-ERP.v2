import { Injectable } from '@nestjs/common';
import { CreateModificadoreDto } from './dto/create-modificadore.dto';
import { UpdateModificadoreDto } from './dto/update-modificadore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modificadore } from './entities/modificadore.entity';

@Injectable()
export class ModificadoresService {
  constructor(
    @InjectRepository(Modificadore)
    private readonly modificadorRepository: Repository<Modificadore>,
  ) {}

  create(createModificadoreDto: CreateModificadoreDto) {
    const modificador = this.modificadorRepository.create(createModificadoreDto);
    return this.modificadorRepository.save(modificador);
  }

  findByProducto(productoId: string) {
    return this.modificadorRepository.find({ where: { productoId } });
  }

  findOne(id: string) {
    return this.modificadorRepository.findOneBy({ id });
  }

  remove(id: string) {
    return this.modificadorRepository.delete(id);
  }
}