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
    empresaId: string,
    usuarioId: string | null,
    entidad: string,
    entidadId: string | null,
    accion: string,
    datosAnteriores: any = null,
    datosNuevos: any = null,
    motivo: string = null
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
}