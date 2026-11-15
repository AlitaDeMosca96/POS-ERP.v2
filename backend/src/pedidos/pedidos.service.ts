import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { Modificadore } from '../modificadores/entities/modificadore.entity';

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
    private readonly dataSource: DataSource
  ) {}

  async create(createPedidoDto: CreatePedidoDto, usuarioId: string, empresaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalCalculado = 0;
      const detallesFinales = [];

      // 1. Validar productos y calcular total
      for (const det of createPedidoDto.detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: det.productoId, empresaId }
        });

        if (!producto) throw new BadRequestException(`Producto ${det.productoId} no encontrado`);
        
        let precioReal = Number(producto.precio);
        let notasFinales = det.notas || '';

        // Validación y cálculo de modificadores
        if (det.modificadoresIds && det.modificadoresIds.length > 0) {
          const modificadores = await queryRunner.manager.find(Modificadore, {
            where: { id: In(det.modificadoresIds), productoId: producto.id }
          });

          if (modificadores.length !== det.modificadoresIds.length) {
            throw new BadRequestException(`Uno o más modificadores no existen o no pertenecen al producto ${producto.nombre}`);
          }

          for (const mod of modificadores) {
            precioReal += Number(mod.precioExtra);
            notasFinales += ` | + ${mod.nombre}`;
          }
        }

        totalCalculado += precioReal * det.cantidad;

        detallesFinales.push({
          cantidad: det.cantidad,
          precioUnitario: precioReal,
          notas: notasFinales.trim(),
          producto: { id: producto.id }
        });
      }

      if (createPedidoDto.costoEnvio) totalCalculado += Number(createPedidoDto.costoEnvio);

      let numeroComprobante: string | undefined = undefined;
      let caeSimulado: string | undefined = undefined;

      if (createPedidoDto.tipoFactura !== 'FACTURA_B' && createPedidoDto.tipoFactura) {
        if (!createPedidoDto.cuitFactura || createPedidoDto.cuitFactura.length !== 11) {
          throw new BadRequestException('CUIT inválido para facturación');
        }
        numeroComprobante = `FAC-${Date.now().toString().slice(-8)}`;
        caeSimulado = `CAE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      }

      let pedidoGuardado;

      if (createPedidoDto.pedidoId) {
        // --- ACTUALIZAR PEDIDO EXISTENTE ---
        const pedidoExistente = await queryRunner.manager.findOne(Pedido, {
          where: { id: createPedidoDto.pedidoId, empresaId },
          relations: { detalles: { producto: true } }
        });

        if (!pedidoExistente) throw new BadRequestException('Pedido original no encontrado');

        // Devolver stock del pedido original
        for (const det of pedidoExistente.detalles) {
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

        await queryRunner.manager.delete('PedidoDetalle', { pedidoId: pedidoExistente.id });
        
        pedidoExistente.total = totalCalculado;
        pedidoExistente.estado = createPedidoDto.estado || pedidoExistente.estado;
        pedidoExistente.metodoPago = createPedidoDto.metodoPago || pedidoExistente.metodoPago;
        pedidoExistente.tipoFactura = createPedidoDto.tipoFactura || pedidoExistente.tipoFactura;
        pedidoExistente.cuitFactura = createPedidoDto.cuitFactura || pedidoExistente.cuitFactura;
        pedidoExistente.razonSocialFactura = createPedidoDto.razonSocialFactura || pedidoExistente.razonSocialFactura;
        pedidoExistente.numeroComprobante = numeroComprobante || pedidoExistente.numeroComprobante;
        pedidoExistente.caeSimulado = caeSimulado || pedidoExistente.caeSimulado;

        // VALIDACIÓN DE MESA (Aislamiento multi-tenant)
        if (createPedidoDto.mesaId) {
          const mesaValida = await queryRunner.manager.findOne(Mesa, { where: { id: createPedidoDto.mesaId, empresaId } });
          if (!mesaValida) throw new BadRequestException('La mesa no pertenece a tu empresa');
          pedidoExistente.mesaId = createPedidoDto.mesaId;
        }
        
        // Asignar Caja y Liberar Mesa al cobrar
        if (pedidoExistente.estado === 'PAGADO') {
          const cajaAbierta = await queryRunner.manager.findOne(Caja, { where: { usuarioAperturaId: usuarioId, estado: 'ABIERTA' } });
          pedidoExistente.cajaId = cajaAbierta ? cajaAbierta.id : pedidoExistente.cajaId;
          
          if (pedidoExistente.mesaId) {
            // Al estar asignada previamente, ya validamos que pertenece a la empresa, pero por seguridad la buscamos de nuevo
            const mesa = await queryRunner.manager.findOne(Mesa, { where: { id: pedidoExistente.mesaId, empresaId } });
            if (mesa) {
              await queryRunner.manager.update(Mesa, pedidoExistente.mesaId, { estado: 'LIBRE' });
            }
          }
        }

        // Validar y descontar stock nuevo
        for (const det of detallesFinales) {
          const recetaNueva = await queryRunner.manager.find(Receta, {
            where: { producto: { id: det.producto.id } }, relations: { insumo: true }
          });
          
          if (recetaNueva.length > 0) {
            for (const item of recetaNueva) {
              const cantidadADescontar = Number(item.cantidad) * det.cantidad;
              const insumoActual = await queryRunner.manager.findOne(Insumo, { where: { id: item.insumo.id } });
              if (!insumoActual || Number(insumoActual.stock) < cantidadADescontar) {
                throw new BadRequestException(`Stock insuficiente del insumo ${item.insumo.nombre}`);
              }
              await queryRunner.manager.decrement(Insumo, { id: item.insumo.id }, 'stock', cantidadADescontar);
            }
          } else {
            const prodActual = await queryRunner.manager.findOne(Producto, { where: { id: det.producto.id } });
            if (!prodActual || Number(prodActual.stock) < det.cantidad) {
              throw new BadRequestException(`Stock insuficiente del producto ${prodActual?.nombre}`);
            }
            await queryRunner.manager.decrement(Producto, { id: det.producto.id }, 'stock', det.cantidad);
          }
          
          await queryRunner.manager.save('PedidoDetalle', { ...det, pedidoId: pedidoExistente.id });
        }

        pedidoGuardado = await queryRunner.manager.save(Pedido, pedidoExistente);

      } else {
        // --- CREAR PEDIDO NUEVO ---
        const cajaAbierta = await queryRunner.manager.findOne(Caja, { where: { usuarioAperturaId: usuarioId, estado: 'ABIERTA' } });

        // VALIDACIÓN DE MESA (Aislamiento multi-tenant)
        if (createPedidoDto.mesaId) {
          const mesaValida = await queryRunner.manager.findOne(Mesa, { where: { id: createPedidoDto.mesaId, empresaId } });
          if (!mesaValida) throw new BadRequestException('La mesa no pertenece a tu empresa');

          if (createPedidoDto.estado === 'ABIERTO') {
            await queryRunner.manager.update(Mesa, createPedidoDto.mesaId, { estado: 'OCUPADA' });
          } else if (createPedidoDto.estado === 'PAGADO') {
            await queryRunner.manager.update(Mesa, createPedidoDto.mesaId, { estado: 'LIBRE' });
          }
        }

        // Validar y descontar stock
        for (const det of detallesFinales) {
          const receta = await queryRunner.manager.find(Receta, {
            where: { producto: { id: det.producto.id } }, relations: { insumo: true }
          });
          
          if (receta.length > 0) {
            for (const item of receta) {
              const cantidadADescontar = Number(item.cantidad) * det.cantidad;
              const insumoActual = await queryRunner.manager.findOne(Insumo, { where: { id: item.insumo.id } });
              if (!insumoActual || Number(insumoActual.stock) < cantidadADescontar) {
                throw new BadRequestException(`Stock insuficiente del insumo ${item.insumo.nombre}`);
              }
              await queryRunner.manager.decrement(Insumo, { id: item.insumo.id }, 'stock', cantidadADescontar);
            }
          } else {
            const prodActual = await queryRunner.manager.findOne(Producto, { where: { id: det.producto.id } });
            if (!prodActual || Number(prodActual.stock) < det.cantidad) {
              throw new BadRequestException(`Stock insuficiente del producto ${prodActual?.nombre}`);
            }
            await queryRunner.manager.decrement(Producto, { id: det.producto.id }, 'stock', det.cantidad);
          }
        }

        const pedidoNuevo = queryRunner.manager.create(Pedido, {
          total: totalCalculado,
          empresaId,
          sucursalId: createPedidoDto.sucursalId || undefined,
          estado: createPedidoDto.estado || 'PAGADO',
          estadoCocina: 'PENDIENTE',
          metodoPago: createPedidoDto.metodoPago || 'EFECTIVO',
          direccionEntrega: createPedidoDto.direccionEntrega || undefined, 
          costoEnvio: createPedidoDto.costoEnvio || 0,
          estadoDelivery: createPedidoDto.direccionEntrega ? 'PENDIENTE' : 'NO_APLICA',
          tipoFactura: createPedidoDto.tipoFactura || 'FACTURA_B',
          cuitFactura: createPedidoDto.cuitFactura || undefined,
          razonSocialFactura: createPedidoDto.razonSocialFactura || undefined,
          numeroComprobante,
          caeSimulado,
          mesaId: createPedidoDto.mesaId || undefined,
          clienteId: createPedidoDto.clienteId || undefined,
          cajaId: cajaAbierta ? cajaAbierta.id : undefined,
          detalles: detallesFinales as any
        } as any);

        pedidoGuardado = await queryRunner.manager.save(Pedido, pedidoNuevo);
      }

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

  async marcarListo(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    await this.pedidoRepository.update(id, { estadoCocina: 'LISTO' });
    return { success: true };
  }

  async findOne(id: string, empresaId: string) {
    const pedido = await this.pedidoRepository.findOne({ 
      where: { id, empresaId },
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