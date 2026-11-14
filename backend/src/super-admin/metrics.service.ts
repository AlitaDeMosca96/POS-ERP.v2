import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Auditoria } from './entities/auditoria.entity';
import * as os from 'os';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async getDashboardData() {
    // 1. Optimización: Usamos QueryBuilder para hacer todo en una sola consulta SQL
    const stats = await this.empresaRepository
      .createQueryBuilder('empresa')
      .leftJoin('empresa.plan', 'plan')
      .select('COUNT(empresa.id)', 'totalEmpresas')
      .addSelect('SUM(CASE WHEN empresa.activa = true THEN 1 ELSE 0 END)', 'activas')
      .addSelect('SUM(CASE WHEN empresa.activa = false THEN 1 ELSE 0 END)', 'suspendidas')
      .addSelect('SUM(CASE WHEN empresa.activa = true THEN plan.precioMensual ELSE 0 END)', 'mrr')
      .getRawOne();

    const totalUsuarios = await this.usuarioRepository.count();

    // 2. Salud del Servidor
    const totalMemoriaGB = os.totalmem() / (1024 ** 3);
    const memoriaLibreGB = os.freemem() / (1024 ** 3);
    const usoMemoria = ((totalMemoriaGB - memoriaLibreGB) / totalMemoriaGB) * 100;

    // 3. Auditorías (Últimas 5)
    const auditorias = await this.auditoriaRepository.find({
      order: { fecha: 'DESC' },
      take: 5
    });

    return {
      mrr: Number(stats.mrr) || 0,
      empresasActivas: Number(stats.activas) || 0,
      empresasSuspendidas: Number(stats.suspendidas) || 0,
      totalUsuarios,
      servidor: {
        usoMemoria: usoMemoria.toFixed(1),
        memoriaTotal: totalMemoriaGB.toFixed(1),
        cargaCpu: os.loadavg()[0].toFixed(2),
        plataforma: os.platform(),
        uptimeHoras: (os.uptime() / 3600).toFixed(1)
      },
      auditorias
    };
  }

  async registrarLog(accion: string, tipo: string) {
    const log = this.auditoriaRepository.create({ accion, tipo });
    await this.auditoriaRepository.save(log);
  }
}