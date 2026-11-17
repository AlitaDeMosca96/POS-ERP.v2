import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async registrar(
    empresaId: string | null,
    usuarioId: string | null,
    entidad: string,
    entidadId: string | null,
    accion: string,
    datosAnteriores: any = null,
    datosNuevos: any = null,
    motivo: string | null = null
  ) {
    const log = this.auditoriaRepository.create({
      empresaId,
      usuarioId,
      entidad,
      entidadId,
      accion,
      datosAnteriores,
      datosNuevos,
      motivo
    });
    return this.auditoriaRepository.save(log);
  }

  async findAll(limit: number = 100) {
    return this.auditoriaRepository.find({
      order: { fecha: 'DESC' },
      take: limit
    });
  }
}