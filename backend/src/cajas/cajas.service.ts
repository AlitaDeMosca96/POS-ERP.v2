import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCajaDto } from './dto/create-caja.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
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

  async cerrar(id: string, saldoFinal: number) {
    const caja = await this.cajaRepository.findOneBy({ id });
    if (!caja) throw new BadRequestException('Caja no encontrada');

    caja.estado = 'CERRADA';
    caja.saldoFinal = saldoFinal;
    caja.fechaCierre = new Date();

    return this.cajaRepository.save(caja);
  }

  findAll(empresaId: string, sucursalId: string | null) {
    // Si el usuario tiene sucursal, solo ve sus cajas. El admin ve todas.
    const query = sucursalId ? { empresaId, sucursalId } : { empresaId };
    
    return this.cajaRepository.find({ 
      where: query,
      relations: { usuario: true, sucursal: true },
      order: { fechaApertura: 'DESC' }
    });
  }

  async registrarMovimiento(dto: CreateMovimientoDto) {
    const caja = await this.cajaRepository.findOneBy({ id: dto.cajaId, estado: 'ABIERTA' });
    if (!caja) throw new BadRequestException('La caja no está abierta o no existe');

    const movimiento = this.movimientoRepository.create(dto);
    return this.movimientoRepository.save(movimiento);
  }

  async obtenerResumen(cajaId: string) {
    const caja = await this.cajaRepository.findOneBy({ id: cajaId });
    if (!caja) throw new BadRequestException('Caja no encontrada');

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

    return {
      caja,
      movimientos,
      ingresos,
      sangrias,
      totalVentasEfectivo,
      saldoEsperado
    };
  }
}