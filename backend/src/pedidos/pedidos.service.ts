import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource // <-- PARA TRANSACCIONES
  ) {}

  async create(createPedidoDto: CreatePedidoDto, usuarioId: string, empresaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalCalculado = 0;
      const detallesFinales = [];

      // 1. VALIDAR PRODUCTOS Y CALCULAR PRECIO EN EL SERVIDOR
      for (const det of createPedidoDto.detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: det.productoId, empresaId }
        });

        if (!producto) throw new BadRequestException(`Producto ${det.productoId} no encontrado`);
        
        // El precio real viene de la base de datos
        const precioReal = Number(producto.precio);
        totalCalculado += precioReal * det.cantidad;

        detallesFinales.push({
          cantidad: det.cantidad,
          precioUnitario: precioReal,
          notas: det.notas,
          producto: { id: producto.id }
        });
      }

      // Sumar costo de envío si corresponde
      if (createPedidoDto.costoEnvio) {
        totalCalculado += Number(createPedidoDto.costoEnvio);
      }

      // 2. REVERTIR STOCK SI ES UNA EDICIÓN
      if (createPedidoDto.pedidoId) {
        const pedidoViejo = await queryRunner.manager.findOne(Pedido, {
          where: { id: createPedidoDto.pedidoId, empresaId },
          relations: { detalles: { producto: true } }
        });

        if (pedidoViejo) {
          for (const det of pedidoViejo.detalles) {
            const recetaVieja = await queryRunner.manager.find(Receta, {
              where: { producto: { id: det.producto.id } }, relations: { insumo: true }
            });

            if (recetaVieja.length > 0) {
              for (const item of recetaVieja) {
                await queryRunner.manager.increment(Insumo, { id: item.insumo.id }, 'stock', Number(item.cantidad) * det.cantidad);
              }
            } else {
              await queryRunner.manager.increment(Producto, { id: det.producto.id }, 'stock', det.cantidad);
            }
          }
          await queryRunner.manager.delete(Pedido, createPedidoDto.pedidoId);
        }
      }

      // 3. DESCONTAR STOCK NUEVO (Atómico)
      for (const det of detallesFinales) {
        const receta = await queryRunner.manager.find(Receta, {
          where: { producto: { id: det.producto.id } }, relations: { insumo: true }
        });

        if (receta.length > 0) {
          for (const item of receta) {
            await queryRunner.manager.decrement(Insumo, { id: item.insumo.id }, 'stock', Number(item.cantidad) * det.cantidad);
          }
        } else {
          await queryRunner.manager.decrement(Producto, { id: det.producto.id }, 'stock', det.cantidad);
        }
      }

      // 4. BUSCAR CAJA ABIERTA
      const cajaAbierta = await queryRunner.manager.findOne(Caja, {
        where: { usuarioId, estado: 'ABIERTA' }
      });

      // 5. ACTUALIZAR MESA
      if (createPedidoDto.mesaId) {
        if (createPedidoDto.estado === 'ABIERTO') {
          await queryRunner.manager.update(Mesa, createPedidoDto.mesaId, { estado: 'OCUPADA' });
        } else if (createPedidoDto.estado === 'PAGADO') {
          await queryRunner.manager.update(Mesa, createPedidoDto.mesaId, { estado: 'LIBRE' });
        }
      }

      // 6. CREAR EL PEDIDO CON EL TOTAL CALCULADO
      const pedido = queryRunner.manager.create(Pedido, {
        total: totalCalculado, // <-- Usamos el total del servidor
        empresaId,
        sucursalId: createPedidoDto.sucursalId || undefined,
        sucursal: createPedidoDto.sucursalId ? { id: createPedidoDto.sucursalId } : undefined,
        estado: createPedidoDto.estado || 'PAGADO',
        estadoCocina: 'PENDIENTE',
        metodoPago: createPedidoDto.metodoPago || 'EFECTIVO',
        direccionEntrega: createPedidoDto.direccionEntrega || undefined, 
        costoEnvio: createPedidoDto.costoEnvio || 0,
        estadoDelivery: createPedidoDto.direccionEntrega ? 'PENDIENTE' : 'NO_APLICA',
        tipoFactura: createPedidoDto.tipoFactura || 'FACTURA_B',
        cuitFactura: createPedidoDto.cuitFactura || undefined,
        razonSocialFactura: createPedidoDto.razonSocialFactura || undefined,
        mesaId: createPedidoDto.mesaId || undefined,
        clienteId: createPedidoDto.clienteId || undefined,
        cliente: createPedidoDto.clienteId ? { id: createPedidoDto.clienteId } : undefined,
        cajaId: cajaAbierta ? cajaAbierta.id : undefined,
        mesa: createPedidoDto.mesaId ? { id: createPedidoDto.mesaId } : undefined,
        detalles: detallesFinales
      });

      const pedidoGuardado = await queryRunner.manager.save(pedido);

      await queryRunner.commitTransaction();
      return pedidoGuardado;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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

  async findOne(id: string, empresaId: string) {
    const pedido = await this.pedidoRepository.findOne({ 
      where: { id, empresaId }, // <-- VALIDACIÓN MULTI-TENANT
      relations: { empresa: true, mesa: true, cliente: true, detalles: { producto: true } }
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.pedidoRepository.update(id, updatePedidoDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.pedidoRepository.delete(id);
  }

  async findAbiertoByMesa(mesaId: string, empresaId: string) {
    return this.pedidoRepository.findOne({
      where: { mesaId: mesaId, empresaId, estado: 'ABIERTO' },
      relations: { detalles: { producto: true } }
    });
  }
}