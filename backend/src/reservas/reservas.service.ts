import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
  ) {}

  create(createReservaDto: CreateReservaDto) {
    const reserva = this.reservaRepository.create({
      fechaHora: createReservaDto.fechaHora,
      cantidadPersonas: createReservaDto.cantidadPersonas,
      empresaId: createReservaDto.empresaId,
      mesa: { id: createReservaDto.mesaId },
      cliente: { id: createReservaDto.clienteId }
    });
    return this.reservaRepository.save(reserva);
  }

  findAll(empresaId: string) {
    return this.reservaRepository.find({
      where: { empresaId },
      relations: { mesa: true, cliente: true },
      order: { fechaHora: 'ASC' }
    });
  }

  async findOne(id: string, empresaId: string) {
    const reserva = await this.reservaRepository.findOne({ 
      where: { id, empresaId },
      relations: { mesa: true, cliente: true }
    });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    return reserva;
  }

  async update(id: string, updateReservaDto: UpdateReservaDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.reservaRepository.update(id, updateReservaDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.reservaRepository.softDelete(id); // <-- SOFT DELETE
  }
}