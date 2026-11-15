import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja } from './entities/caja.entity';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
  ) {}

  async obtenerCajaAbierta(empresaId: string, sucursalId?: string) {
    if (!sucursalId) return null; 
    return this.cajaRepository.findOne({
      where: { empresaId, sucursalId, estado: 'ABIERTA' },
    });
  }

  async abrir(empresaId: string, sucursalId: string, usuarioId: string, montoInicial: number) {
    const cajaExistente = await this.obtenerCajaAbierta(empresaId, sucursalId);
    if (cajaExistente) throw new BadRequestException('Ya hay una caja abierta');

    const nuevaCaja = this.cajaRepository.create({
      empresaId,
      sucursalId,
      usuarioAperturaId: usuarioId,
      montoInicial,
      saldoEsperado: montoInicial,
      estado: 'ABIERTA',
    });
    return this.cajaRepository.save(nuevaCaja);
  }

  async cerrar(id: string, empresaId: string, saldoFinal: number, usuarioId: string) {
    const caja = await this.cajaRepository.findOne({ where: { id, empresaId, estado: 'ABIERTA' } });
    if (!caja) throw new NotFoundException('Caja no encontrada o ya cerrada');

    caja.saldoFinal = saldoFinal;
    caja.usuarioCierreId = usuarioId;
    caja.estado = 'CERRADA';
    caja.fechaCierre = new Date();
    return this.cajaRepository.save(caja);
  }
}