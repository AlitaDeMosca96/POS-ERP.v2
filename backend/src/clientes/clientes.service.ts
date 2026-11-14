import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.clienteRepository.find({ where: { empresaId }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string, empresaId: string) {
    const cliente = await this.clienteRepository.findOneBy({ id, empresaId });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.clienteRepository.update(id, updateClienteDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.clienteRepository.softDelete(id); // <-- SOFT DELETE
  }
}