import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja } from './entities/caja.entity';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
  ) {}

  async abrir(createCajaDto: CreateCajaDto) {
    // Verificamos si el usuario ya tiene una caja abierta
    const cajaAbierta = await this.cajaRepository.findOne({
      where: { usuarioId: createCajaDto.usuarioId, estado: 'ABIERTA' }
    });

    if (cajaAbierta) {
      throw new BadRequestException('El usuario ya tiene una caja abierta');
    }

    const caja = this.cajaRepository.create({
      saldoInicial: createCajaDto.saldoInicial,
      empresaId: createCajaDto.empresaId,
      usuarioId: createCajaDto.usuarioId,
      estado: 'ABIERTA'
    });
    return this.cajaRepository.save(caja);
  }

  async buscarAbierta(usuarioId: string, empresaId: string) {
    return this.cajaRepository.findOne({
      where: { usuarioId, empresaId, estado: 'ABIERTA' }
    });
  }

  async cerrar(id: string, saldoFinal: number) {
    const caja = await this.cajaRepository.findOneBy({ id });
    if (!caja) throw new BadRequestException('Caja no encontrada');

    caja.estado = 'CERRADA';
    caja.saldoFinal = saldoFinal;
    caja.fechaCierre = new Date();

    return this.cajaRepository.save(caja);
  }

  findAll(empresaId: string) {
    return this.cajaRepository.find({ 
      where: { empresaId },
      relations: { usuario: true },
      order: { fechaApertura: 'DESC' }
    });
  }
}