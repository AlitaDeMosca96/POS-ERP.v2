import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  create(createClienteDto: CreateClienteDto) {
    const cliente = this.clienteRepository.create(createClienteDto);
    return this.clienteRepository.save(cliente);
  }

  findAll(empresaId: string) {
    return this.clienteRepository.find({ 
      where: { empresaId },
      order: { nombre: 'ASC' }
    });
  }

  findOne(id: string) {
    return this.clienteRepository.findOneBy({ id });
  }

  update(id: string, updateClienteDto: UpdateClienteDto) {
    return this.clienteRepository.update(id, updateClienteDto);
  }

  remove(id: string) {
    return this.clienteRepository.delete(id);
  }
}