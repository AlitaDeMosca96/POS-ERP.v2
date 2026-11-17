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

  async getResumen(empresaId: string, sucursalId: string | null, fechaInicio?: string, fechaFin?: string) {
    // Si no se envían fechas, por defecto traemos el mes en curso en Argentina
    let inicio = fechaInicio;
    let fin = fechaFin;

    if (!inicio || !fin) {
      const hoy = new Date();
      // Convertimos a hora Argentina para obtener el mes/año correcto
      const argDate = new Date(hoy.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
      const year = argDate.getFullYear();
      const month = argDate.getMonth();
      
      const primerDia = new Date(year, month, 1);
      const ultimoDia = new Date(year, month + 1, 0);

      // Formateamos YYYY-MM-DD
      const formatDate = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      inicio = formatDate(primerDia);
      fin = formatDate(ultimoDia);
    }

    // Agregamos la zona horaria al rango para que Postgres sepa exactamente qué buscar
    const startDate = `${inicio} 00:00:00-03:00`;
    const endDate = `${fin} 23:59:59-03:00`;

    const query = this.pedidoRepository.createQueryBuilder('pedido')
      .where('pedido.empresaId = :empresaId', { empresaId })
      .andWhere('pedido.estado = :estado', { estado: 'PAGADO' })
      .andWhere('pedido.createdAt >= :startDate', { startDate })
      .andWhere('pedido.createdAt <= :endDate', { endDate });

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

    // 4. Top 5 productos
    const topProductosQuery = this.pedidoRepository.createQueryBuilder('pedido')
      .leftJoin('pedido.detalles', 'detalle')
      .leftJoin('detalle.producto', 'producto')
      .where('pedido.empresaId = :empresaId', { empresaId })
      .andWhere('pedido.estado = :estado', { estado: 'PAGADO' })
      .andWhere('pedido.createdAt >= :startDate', { startDate })
      .andWhere('pedido.createdAt <= :endDate', { endDate });

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
      fechaInicio: inicio,
      fechaFin: fin,
      totalVentas: new Decimal(totales.totalVentas || 0).toNumber(),
      cantidadPedidos: Number(totales.cantidadPedidos || 0),
      metodosPago,
      topProductos
    };
  }
}