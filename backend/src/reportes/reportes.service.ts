import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async getResumen(empresaId: string, sucursalId: string | null) {
    const query = this.pedidoRepository.createQueryBuilder('pedido')
      .where('pedido.empresaId = :empresaId', { empresaId })
      .andWhere('pedido.estado = :estado', { estado: 'PAGADO' });

    if (sucursalId) {
      query.andWhere('pedido.sucursalId = :sucursalId', { sucursalId });
    }

    // 1. Totales generales calculados en SQL
    const totales = await query
      .select('COALESCE(SUM(pedido.total), 0)', 'totalVentas')
      .addSelect('COUNT(pedido.id)', 'cantidadPedidos')
      .getRawOne();

    // 2. Ventas por medio de pago en SQL
    const pagos = await query
      .select('pedido.metodoPago', 'metodo')
      .addSelect('SUM(pedido.total)', 'total')
      .groupBy('pedido.metodoPago')
      .getRawMany();

    const metodosPago = pagos.map(p => ({ name: p.metodo, value: Number(p.total) }));

    // 3. Top 5 productos (Requiere un JOIN con PedidoDetalle)
    const topProductosRaw = await this.pedidoRepository.createQueryBuilder('pedido')
      .leftJoin('pedido.detalles', 'detalle')
      .leftJoin('detalle.producto', 'producto')
      .where('pedido.empresaId = :empresaId', { empresaId })
      .andWhere('pedido.estado = :estado', { estado: 'PAGADO' })
      .select('producto.nombre', 'nombre')
      .addSelect('SUM(detalle.cantidad)', 'cantidad')
      .addSelect('SUM(detalle.cantidad * detalle.precioUnitario)', 'total')
      .groupBy('producto.nombre')
      .orderBy('cantidad', 'DESC')
      .limit(5)
      .getRawMany();

    const topProductos = topProductosRaw.map(p => ({
      nombre: p.nombre || 'Producto Eliminado',
      cantidad: Number(p.cantidad),
      total: Number(p.total)
    }));

    return {
      totalVentas: Number(totales.totalVentas),
      cantidadPedidos: Number(totales.cantidadPedidos),
      metodosPago,
      topProductos
    };
  }
}