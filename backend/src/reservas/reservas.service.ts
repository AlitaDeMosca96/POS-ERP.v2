import { Injectable } from '@nestjs/common';
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

  findOne(id: string) {
    return this.reservaRepository.findOne({
      where: { id },
      relations: { mesa: true, cliente: true }
    });
  }

  update(id: string, updateReservaDto: UpdateReservaDto) {
    return this.reservaRepository.update(id, updateReservaDto);
  }

  remove(id: string) {
    return this.reservaRepository.delete(id);
  }
}