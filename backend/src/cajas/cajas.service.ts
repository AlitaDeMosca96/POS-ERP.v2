import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCajaDto } from './dto/create-caja.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja } from './entities/caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    @InjectRepository(MovimientoCaja)
    private readonly movimientoRepository: Repository<MovimientoCaja>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async abrir(createCajaDto: CreateCajaDto) {
    const cajaAbierta = await this.cajaRepository.findOne({
      where: { usuarioId: createCajaDto.usuarioId, estado: 'ABIERTA' }
    });

    if (cajaAbierta) throw new BadRequestException('El usuario ya tiene una caja abierta');

    const caja = this.cajaRepository.create({
      saldoInicial: createCajaDto.saldoInicial,
      empresaId: createCajaDto.empresaId,
      usuarioId: createCajaDto.usuarioId,
      sucursalId: createCajaDto.sucursalId || undefined,
      sucursal: createCajaDto.sucursalId ? { id: createCajaDto.sucursalId } : undefined,
      estado: 'ABIERTA'
    });
    return this.cajaRepository.save(caja);
  }

  async buscarAbierta(usuarioId: string, empresaId: string) {
    return this.cajaRepository.findOne({
      where: { usuarioId, empresaId, estado: 'ABIERTA' }
    });
  }

  async cerrar(id: string, saldoFinal: number, empresaId: string) {
    const caja = await this.cajaRepository.findOneBy({ id, empresaId });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === 'CERRADA') throw new BadRequestException('La caja ya está cerrada');

    // Calculamos el saldo real esperado en el servidor
    const resumen = await this.obtenerResumen(id);
    const saldoEsperado = resumen.saldoEsperado;

    caja.estado = 'CERRADA';
    caja.saldoFinal = saldoFinal; // Se guarda lo que el cajero contó físicamente
    caja.fechaCierre = new Date();

    await this.cajaRepository.save(caja);

    // Retornamos si hubo faltante o sobrante para que el frontend lo muestre
    return {
      caja,
      saldoEsperado,
      diferencia: saldoFinal - saldoEsperado
    };
  }

  findAll(empresaId: string, sucursalId: string | null) {
    const query = sucursalId ? { empresaId, sucursalId } : { empresaId };
    return this.cajaRepository.find({ 
      where: query,
      relations: { usuario: true, sucursal: true },
      order: { fechaApertura: 'DESC' }
    });
  }

  async registrarMovimiento(dto: CreateMovimientoDto, empresaId: string) {
    if (dto.monto <= 0) throw new BadRequestException('El monto debe ser mayor a 0');
    
    const caja = await this.cajaRepository.findOneBy({ id: dto.cajaId, empresaId, estado: 'ABIERTA' });
    if (!caja) throw new BadRequestException('La caja no está abierta o no existe');

    const movimiento = this.movimientoRepository.create(dto);
    return this.movimientoRepository.save(movimiento);
  }

  async obtenerResumen(cajaId: string) {
    const caja = await this.cajaRepository.findOneBy({ id: cajaId });
    if (!caja) throw new NotFoundException('Caja no encontrada');

    const movimientos = await this.movimientoRepository.find({ 
      where: { cajaId },
      order: { fecha: 'DESC' }
    });

    let ingresos = 0;
    let sangrias = 0;

    movimientos.forEach(mov => {
      if (mov.tipo === 'INGRESO') ingresos += Number(mov.monto);
      if (mov.tipo === 'SANGRIA') sangrias += Number(mov.monto);
    });

    const ventasEfectivo = await this.pedidoRepository.find({
      where: { cajaId, metodoPago: 'EFECTIVO', estado: 'PAGADO' }
    });
    
    const totalVentasEfectivo = ventasEfectivo.reduce((acc, pedido) => acc + Number(pedido.total), 0);
    const saldoEsperado = Number(caja.saldoInicial) + ingresos - sangrias + totalVentasEfectivo;

    return { caja, movimientos, ingresos, sangrias, totalVentasEfectivo, saldoEsperado };
  }
}