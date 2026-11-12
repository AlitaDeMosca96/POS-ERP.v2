import { Injectable } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    if (createPedidoDto.pedidoId) {
      const pedidoViejo = await this.pedidoRepository.findOne({
        where: { id: createPedidoDto.pedidoId },
        relations: { detalles: { producto: true } }
      });
      if (pedidoViejo) {
        for (const det of pedidoViejo.detalles) {
          const producto = await this.productoRepository.findOneBy({ id: det.producto.id });
          if (producto) {
            producto.stock += det.cantidad;
            await this.productoRepository.save(producto);
          }
        }
        await this.pedidoRepository.delete(createPedidoDto.pedidoId);
      }
    }

    for (const det of createPedidoDto.detalles) {
      const producto = await this.productoRepository.findOneBy({ id: det.productoId });
      if (producto) {
        producto.stock = producto.stock - det.cantidad;
        await this.productoRepository.save(producto);
      }
    }

    if (createPedidoDto.mesaId) {
      if (createPedidoDto.estado === 'ABIERTO') {
        await this.mesaRepository.update(createPedidoDto.mesaId, { estado: 'OCUPADA' });
      } else if (createPedidoDto.estado === 'PAGADO') {
        await this.mesaRepository.update(createPedidoDto.mesaId, { estado: 'LIBRE' });
      }
    }

    const pedido = this.pedidoRepository.create({
      total: createPedidoDto.total,
      empresaId: createPedidoDto.empresaId,
      estado: createPedidoDto.estado || 'PAGADO',
      mesaId: createPedidoDto.mesaId || undefined, // <-- GUARDAMOS LA COLUMNA DIRECTA
      mesa: createPedidoDto.mesaId ? { id: createPedidoDto.mesaId } : undefined,
      detalles: createPedidoDto.detalles.map(det => ({
        cantidad: det.cantidad,
        precioUnitario: det.precioUnitario,
        producto: { id: det.productoId },
      }))
    });
    return this.pedidoRepository.save(pedido);
  }

  findAll(empresaId: string) {
    return this.pedidoRepository.find({ 
      where: { empresaId },
      relations: { empresa: true, mesa: true, detalles: { producto: true } },
      order: { createdAt: 'DESC' }
    });
  }

  findOne(id: string) {
    return this.pedidoRepository.findOne({ 
      where: { id },
      relations: { empresa: true, mesa: true, detalles: { producto: true } }
    });
  }

  update(id: string, updatePedidoDto: UpdatePedidoDto) {
    return this.pedidoRepository.update(id, updatePedidoDto);
  }

  remove(id: string) {
    return this.pedidoRepository.delete(id);
  }

  async findAbiertoByMesa(mesaId: string, empresaId: string) {
    return this.pedidoRepository.findOne({
      where: {
        mesaId: mesaId, // <-- BUSCAMOS POR LA COLUMNA DIRECTA
        empresaId,
        estado: 'ABIERTO'
      },
      relations: { detalles: { producto: true } }
    });
  }
}