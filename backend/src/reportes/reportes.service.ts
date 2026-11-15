import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async getResumen(empresaId: string, sucursalId: string | null) {
    // 1. Base de la query
    const query = this.pedidoRepository.createQueryBuilder('pedido')
      .where('pedido.empresaId = :empresaId', { empresaId })
      .andWhere('pedido.estado = :estado', { estado: 'PAGADO' });

    if (sucursalId) {
      query.andWhere('pedido.sucursalId = :sucursalId', { sucursalId });
    }

    // 2. Totales generales
    const totales = await query
      .select('COALESCE(SUM(pedido.total), 0)', 'totalVentas')
      .addSelect('COUNT(pedido.id)', 'cantidadPedidos')
      .getRawOne();

    // 3. Ventas por medio de pago
    const pagos = await query
      .select('pedido.metodoPago', 'metodo')
      .addSelect('SUM(pedido.total)', 'total')
      .groupBy('pedido.metodoPago')
      .getRawMany();

    const metodosPago = pagos.map(p => ({ 
      name: p.metodo, 
      value: new Decimal(p.total).toNumber() 
    }));

    // 4. Top 5 productos (CORREGIDO: Ahora aplica el filtro de sucursalId)
    const topProductosQuery = this.pedidoRepository.createQueryBuilder('pedido')
      .leftJoin('pedido.detalles', 'detalle')
      .leftJoin('detalle.producto', 'producto')
      .where('pedido.empresaId = :empresaId', { empresaId })
      .andWhere('pedido.estado = :estado', { estado: 'PAGADO' });

    if (sucursalId) {
      topProductosQuery.andWhere('pedido.sucursalId = :sucursalId', { sucursalId });
    }

    const topProductosRaw = await topProductosQuery
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
      total: new Decimal(p.total).toNumber()
    }));

    return {
      totalVentas: new Decimal(totales.totalVentas || 0).toNumber(),
      cantidadPedidos: Number(totales.cantidadPedidos || 0),
      metodosPago,
      topProductos
    };
  }
}