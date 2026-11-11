import { Injectable } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const pedido = this.pedidoRepository.create({
      total: createPedidoDto.total,
      empresaId: createPedidoDto.empresaId,
      detalles: createPedidoDto.detalles.map(det => ({
        cantidad: det.cantidad,
        precioUnitario: det.precioUnitario,
        producto: { id: det.productoId }, // <-- ACÁ LE DECIMOS LA RELACIÓN
      }))
    });
    return this.pedidoRepository.save(pedido);
  }

  findAll() {
    return this.pedidoRepository.find({ relations: { empresa: true, detalles: true } });
  }

  findOne(id: string) {
    return this.pedidoRepository.findOne({ 
      where: { id },
      relations: { empresa: true, detalles: true }
    });
  }

  update(id: string, updatePedidoDto: UpdatePedidoDto) {
    return this.pedidoRepository.update(id, updatePedidoDto);
  }

  remove(id: string) {
    return this.pedidoRepository.delete(id);
  }
}