import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { Caja } from './entities/caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    @InjectRepository(MovimientoCaja)
    private readonly movimientoRepository: Repository<MovimientoCaja>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async obtenerCajaAbierta(empresaId: string, sucursalId?: string) {
    if (!sucursalId) return null;
    return this.cajaRepository.findOne({
      where: { empresaId, sucursalId, estado: 'ABIERTA' },
    });
  }

  async abrir(empresaId: string, sucursalId: string, usuarioId: string, montoInicial: number) {
    if (!sucursalId) {
      throw new BadRequestException('Se requiere sucursalId para abrir una caja');
    }

    const sucursal = await this.sucursalRepository.findOne({
      where: { id: sucursalId, empresaId }
    });
    if (!sucursal) {
      throw new BadRequestException('La sucursal no existe o no pertenece a tu empresa');
    }

    const cajaExistente = await this.obtenerCajaAbierta(empresaId, sucursalId);
    if (cajaExistente) throw new BadRequestException('Ya hay una caja abierta en esta sucursal');

    const nuevaCaja = this.cajaRepository.create({
      empresaId,
      sucursalId,
      usuarioAperturaId: usuarioId,
      montoInicial,
      saldoEsperado: montoInicial,
      estado: 'ABIERTA',
    });
    const cajaGuardada = await this.cajaRepository.save(nuevaCaja);

    await this.auditoriaService.registrar(
      empresaId, usuarioId, 'CAJA', cajaGuardada.id, 'ABRIR', null, { montoInicial }
    );

    return cajaGuardada;
  }

  async obtenerResumen(cajaId: string, empresaId: string) {
    const caja = await this.cajaRepository.findOne({ where: { id: cajaId, empresaId } });
    if (!caja) throw new NotFoundException('Caja no encontrada');

    const ventas = await this.pedidoRepository.createQueryBuilder('pedido')
      .select('SUM(pedido.total)', 'total')
      .where('pedido.cajaId = :cajaId', { cajaId: caja.id })
      .andWhere('pedido.metodoPago = :metodo', { metodo: 'EFECTIVO' })
      .andWhere('pedido.estado = :estado', { estado: 'PAGADO' })
      .getRawOne();

    const movimientos = await this.movimientoRepository.find({ where: { cajaId: caja.id } });

    let ingresos = new Decimal(0);
    let egresos = new Decimal(0);

    movimientos.forEach(mov => {
      if (mov.tipo === 'INGRESO') ingresos = ingresos.plus(mov.monto);
      if (mov.tipo === 'EGRESO') egresos = egresos.plus(mov.monto);
    });

    const totalVentasEfectivo = new Decimal(ventas?.total || 0);

    const saldoEsperado = new Decimal(caja.montoInicial)
      .plus(totalVentasEfectivo)
      .plus(ingresos)
      .minus(egresos);

    return {
      montoInicial: new Decimal(caja.montoInicial).toNumber(),
      ventasEfectivo: totalVentasEfectivo.toNumber(),
      ingresos: ingresos.toNumber(),
      egresos: egresos.toNumber(),
      saldoEsperado: saldoEsperado.toNumber()
    };
  }

  async registrarMovimiento(cajaId: string, empresaId: string, tipo: string, monto: number, motivo: string, usuarioId: string) {
    const caja = await this.cajaRepository.findOne({ where: { id: cajaId, empresaId, estado: 'ABIERTA' } });
    if (!caja) throw new BadRequestException('Caja no encontrada o ya cerrada');

    const movimiento = this.movimientoRepository.create({
      cajaId,
      tipo,
      monto,
      motivo
    });
    const movGuardado = await this.movimientoRepository.save(movimiento);

    await this.auditoriaService.registrar(
      empresaId, usuarioId, 'CAJA', cajaId, 'MOVIMIENTO', null, { tipo, monto, motivo }
    );

    return movGuardado;
  }

  async cerrar(cajaId: string, empresaId: string, saldoFinal: number, usuarioId: string) {
    const caja = await this.cajaRepository.findOne({ where: { id: cajaId, empresaId, estado: 'ABIERTA' } });
    if (!caja) throw new NotFoundException('Caja no encontrada o ya cerrada');

    const resumen = await this.obtenerResumen(cajaId, empresaId);

    const datosAnteriores = { estado: caja.estado, saldoEsperado: caja.saldoEsperado };

    caja.saldoEsperado = resumen.saldoEsperado;
    caja.saldoFinal = saldoFinal;
    caja.usuarioCierreId = usuarioId;
    caja.estado = 'CERRADA';
    caja.fechaCierre = new Date();

    const cajaCerrada = await this.cajaRepository.save(caja);

    await this.auditoriaService.registrar(
      empresaId, usuarioId, 'CAJA', cajaCerrada.id, 'CERRAR', datosAnteriores, { estado: 'CERRADA', saldoFinal, saldoEsperado: caja.saldoEsperado }
    );

    return cajaCerrada;
  }
}