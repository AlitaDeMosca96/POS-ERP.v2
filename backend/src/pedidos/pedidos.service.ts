import { Injectable } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    for (const det of createPedidoDto.detalles) {
      const producto = await this.productoRepository.findOneBy({ id: det.productoId });
      if (producto) {
        producto.stock = producto.stock - det.cantidad;
        await this.productoRepository.save(producto);
      }
    }

    const pedido = this.pedidoRepository.create({
      total: createPedidoDto.total,
      empresaId: createPedidoDto.empresaId,
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
      // ACÁ AGREGAMOS LA RELACIÓN ANIDADA DEL PRODUCTO
      relations: { empresa: true, detalles: { producto: true } },
      order: { createdAt: 'DESC' } // Trae los más nuevos primero
    });
  }

  findOne(id: string) {
    return this.pedidoRepository.findOne({ 
      where: { id },
      relations: { empresa: true, detalles: { producto: true } }
    });
  }

  update(id: string, updatePedidoDto: UpdatePedidoDto) {
    return this.pedidoRepository.update(id, updatePedidoDto);
  }

  remove(id: string) {
    return this.pedidoRepository.delete(id);
  }
}