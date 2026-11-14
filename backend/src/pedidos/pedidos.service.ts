import { Injectable } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { Insumo } from '../insumos/entities/insumo.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto, usuarioId: string) {
    const cajaAbierta = await this.cajaRepository.findOne({
      where: { usuarioId, estado: 'ABIERTA' }
    });

    if (createPedidoDto.pedidoId) {
      const pedidoViejo = await this.pedidoRepository.findOne({
        where: { id: createPedidoDto.pedidoId },
        relations: { detalles: { producto: true } }
      });
      if (pedidoViejo) {
        for (const det of pedidoViejo.detalles) {
          const recetaVieja = await this.recetaRepository.find({
            where: { producto: { id: det.producto.id } },
            relations: { insumo: true }
          });
          if (recetaVieja.length > 0) {
             for (const item of recetaVieja) {
               const insumo = await this.insumoRepository.findOneBy({ id: item.insumo.id });
               if (insumo) {
                 insumo.stock += (Number(item.cantidad) * det.cantidad);
                 await this.insumoRepository.save(insumo);
               }
             }
          } else {
             const producto = await this.productoRepository.findOneBy({ id: det.producto.id });
             if (producto) {
               producto.stock += det.cantidad;
               await this.productoRepository.save(producto);
             }
          }
        }
        await this.pedidoRepository.delete(createPedidoDto.pedidoId);
      }
    }

    for (const det of createPedidoDto.detalles) {
      const receta = await this.recetaRepository.find({ 
        where: { producto: { id: det.productoId } },
        relations: { insumo: true }
      });

      if (receta.length > 0) {
        for (const item of receta) {
          const insumo = await this.insumoRepository.findOneBy({ id: item.insumo.id });
          if (insumo) {
            insumo.stock = insumo.stock - (Number(item.cantidad) * det.cantidad);
            await this.insumoRepository.save(insumo);
          }
        }
      } else {
        const producto = await this.productoRepository.findOneBy({ id: det.productoId });
        if (producto) {
          producto.stock = producto.stock - det.cantidad;
          await this.productoRepository.save(producto);
        }
      }
    }

    if (createPedidoDto.mesaId) {
      if (createPedidoDto.estado === 'ABIERTO') {
        await this.mesaRepository.update(createPedidoDto.mesaId, { estado: 'OCUPADA' });
      } else if (createPedidoDto.estado === 'PAGADO') {
        await this.mesaRepository.update(createPedidoDto.mesaId, { estado: 'LIBRE' });
      }
    }

    const esDelivery = !!createPedidoDto.direccionEntrega;

    const pedido = this.pedidoRepository.create({
      total: createPedidoDto.total,
      empresaId: createPedidoDto.empresaId,
      sucursalId: createPedidoDto.sucursalId || undefined,
      sucursal: createPedidoDto.sucursalId ? { id: createPedidoDto.sucursalId } : undefined,
      estado: createPedidoDto.estado || 'PAGADO',
      estadoCocina: 'PENDIENTE',
      metodoPago: createPedidoDto.metodoPago || 'EFECTIVO',
      
      // --- ACÁ ESTABA EL ERROR DE TYPESCRIPT ---
      direccionEntrega: createPedidoDto.direccionEntrega || undefined, 
      costoEnvio: createPedidoDto.costoEnvio || 0,
      estadoDelivery: esDelivery ? 'PENDIENTE' : 'NO_APLICA',
      
      mesaId: createPedidoDto.mesaId || undefined,
      clienteId: createPedidoDto.clienteId || undefined,
      cliente: createPedidoDto.clienteId ? { id: createPedidoDto.clienteId } : undefined,
      cajaId: cajaAbierta ? cajaAbierta.id : undefined,
      mesa: createPedidoDto.mesaId ? { id: createPedidoDto.mesaId } : undefined,
      detalles: createPedidoDto.detalles.map(det => ({
        cantidad: det.cantidad,
        precioUnitario: det.precioUnitario,
        notas: det.notas,
        producto: { id: det.productoId },
      }))
    });
    return this.pedidoRepository.save(pedido);
  }

  findAll(empresaId: string, sucursalId: string | null) {
    const query = sucursalId ? { empresaId, sucursalId } : { empresaId };
    return this.pedidoRepository.find({ 
      where: query,
      relations: { empresa: true, mesa: true, cliente: true, detalles: { producto: true } },
      order: { createdAt: 'DESC' }
    });
  }

  findPendientesCocina(empresaId: string, sucursalId: string | null) {
    const query = sucursalId 
      ? { empresaId, sucursalId, estadoCocina: 'PENDIENTE' } 
      : { empresaId, estadoCocina: 'PENDIENTE' };
    return this.pedidoRepository.find({
      where: query,
      relations: { mesa: true, detalles: { producto: true } },
      order: { createdAt: 'ASC' }
    });
  }

  findDeliveryPendientes(empresaId: string, sucursalId: string | null) {
    const query = sucursalId 
      ? { empresaId, sucursalId, estadoDelivery: 'PENDIENTE' } 
      : { empresaId, estadoDelivery: 'PENDIENTE' };
    
    return this.pedidoRepository.find({
      where: query,
      relations: { cliente: true, detalles: { producto: true } },
      order: { createdAt: 'ASC' }
    });
  }

  async marcarListo(id: string) {
    await this.pedidoRepository.update(id, { estadoCocina: 'LISTO' });
    return { success: true };
  }

  findOne(id: string) {
    return this.pedidoRepository.findOne({ 
      where: { id },
      relations: { empresa: true, mesa: true, cliente: true, detalles: { producto: true } }
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
      where: { mesaId: mesaId, empresaId, estado: 'ABIERTO' },
      relations: { detalles: { producto: true } }
    });
  }
}