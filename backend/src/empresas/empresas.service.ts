import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  create(createEmpresaDto: CreateEmpresaDto) {
    const empresa = this.empresaRepository.create({
      nombre: createEmpresaDto.nombre,
      cuit: createEmpresaDto.cuit || undefined,
      monedaBase: createEmpresaDto.monedaBase || 'ARS',
      activa: true
    });
    return this.empresaRepository.save(empresa);
  }

  findAll() {
    return this.empresaRepository.find();
  }

  findOne(id: string) {
    return this.empresaRepository.findOneBy({ id });
  }

  update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresaRepository.update(id, updateEmpresaDto);
  }

  remove(id: string) {
    return this.empresaRepository.delete(id);
  }
}