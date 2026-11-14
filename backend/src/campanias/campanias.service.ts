import { Injectable } from '@nestjs/common';
import { CreateCampaniaDto } from './dto/create-campania.dto';
import { UpdateCampaniaDto } from './dto/update-campania.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campania } from './entities/campania.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class CampaniasService {
  constructor(
    @InjectRepository(Campania)
    private readonly campaniaRepository: Repository<Campania>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createCampaniaDto: CreateCampaniaDto) {
    // 1. Contamos cuántos clientes tiene la empresa para simular el envío
    const cantidadClientes = await this.clienteRepository.count({
      where: { empresaId: createCampaniaDto.empresaId }
    });

    // 2. Creamos la campaña con el conteo de envíos
    const campania = this.campaniaRepository.create({
      asunto: createCampaniaDto.asunto,
      mensaje: createCampaniaDto.mensaje,
      empresaId: createCampaniaDto.empresaId,
      cantidadEnviados: cantidadClientes
    });

    return this.campaniaRepository.save(campania);
  }

  findAll(empresaId: string) {
    return this.campaniaRepository.find({
      where: { empresaId },
      order: { fecha: 'DESC' } // Las más nuevas primero
    });
  }
}