import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { PedidoDetalle } from '../pedidos/entities/pedido-detalle.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(PedidoDetalle)
    private readonly detalleRepository: Repository<PedidoDetalle>,
  ) {}

  async getResumen(empresaId: string) {
    // 1. Buscamos todos los pedidos pagados de la empresa
    const pedidos = await this.pedidoRepository.find({
      where: { empresaId, estado: 'PAGADO' },
      relations: { detalles: { producto: true } }
    });

    let totalVentas = 0;
    let ventasEfectivo = 0;
    let ventasTarjeta = 0;
    let ventasTransferencia = 0;
    const productosCount: Record<string, { nombre: string, cantidad: number, total: number }> = {};

    // 2. Procesamos los datos
    pedidos.forEach(pedido => {
      const monto = Number(pedido.total);
      totalVentas += monto;

      if (pedido.metodoPago === 'EFECTIVO') ventasEfectivo += monto;
      else if (pedido.metodoPago === 'TARJETA') ventasTarjeta += monto;
      else ventasTransferencia += monto;

      // Contamos los productos vendidos
      pedido.detalles.forEach(det => {
        const prodNombre = det.producto?.nombre || 'Producto Eliminado';
        if (!productosCount[prodNombre]) {
          productosCount[prodNombre] = { nombre: prodNombre, cantidad: 0, total: 0 };
        }
        productosCount[prodNombre].cantidad += det.cantidad;
        productosCount[prodNombre].total += (Number(det.precioUnitario) * det.cantidad);
      });
    });

    // 3. Armamos el Top 5 de productos más vendidos
    const topProductos = Object.values(productosCount)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return {
      totalVentas,
      cantidadPedidos: pedidos.length,
      metodosPago: [
        { name: 'Efectivo', value: ventasEfectivo },
        { name: 'Tarjeta', value: ventasTarjeta },
        { name: 'Transferencia', value: ventasTransferencia }
      ],
      topProductos
    };
  }
}