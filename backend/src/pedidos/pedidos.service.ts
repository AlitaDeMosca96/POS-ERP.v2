import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In, EntityManager } from 'typeorm';
import Decimal from 'decimal.js';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { Modificadore } from '../modificadores/entities/modificadore.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';

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
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async obtenerCajaAbiertaSucursal(manager: EntityManager, empresaId: string, sucursalId?: string | null) {
    if (!sucursalId) return null;
    return manager.findOne(Caja, { where: { empresaId, sucursalId, estado: 'ABIERTA' } });
  }

  private async revertirStockPedido(manager: EntityManager, pedido: Pedido) {
    for (const det of pedido.detalles) {
      if (Array.isArray(det.recetaSnapshot) && det.recetaSnapshot.length > 0) {
        for (const item of det.recetaSnapshot) {
          const cantidadADevolver = Number(item.cantidad) * det.cantidad;
          await manager.increment(Insumo, { id: item.insumoId }, 'stock', cantidadADevolver);
        }
      } else {
        const receta = await manager.find(Receta, {
          where: { productoId: det.productoId },
          relations: { insumo: true }
        });
        if (receta.length > 0) {
          for (const item of receta) {
            const cantidadADevolver = Number(item.cantidad) * det.cantidad;
            await manager.increment(Insumo, { id: item.insumo.id }, 'stock', cantidadADevolver);
          }
        } else {
          await manager.increment(Producto, { id: det.productoId }, 'stock', det.cantidad);
        }
      }
    }
  }

  private async descontarStock(manager: EntityManager, empresaId: string, det: any) {
    if (det.recetaSnapshot && det.recetaSnapshot.length > 0) {
      for (const item of det.recetaSnapshot) {
        const cantidadADescontar = Number(item.cantidad) * det.cantidad;
        const res = await manager.createQueryBuilder()
          .update(Insumo)
          .set({ stock: () => `stock - ${cantidadADescontar}` })
          .where('id = :id AND stock >= :cantidad', { id: item.insumoId, cantidad: cantidadADescontar })
          .execute();
        
        if (res.affected === 0) {
          throw new BadRequestException(`Stock insuficiente del insumo ${item.nombre}`);
        }
      }
    } else {
      const res = await manager.createQueryBuilder()
        .update(Producto)
        .set({ stock: () => `stock - ${det.cantidad}` })
        .where('id = :id AND "empresaId" = :empresaId AND stock >= :cantidad', { id: det.productoId, empresaId, cantidad: det.cantidad })
        .execute();

      if (res.affected === 0) {
        const prod = await manager.findOne(Producto, { where: { id: det.productoId, empresaId } });
        throw new BadRequestException(`Stock insuficiente del producto ${prod?.nombre || det.productoId}`);
      }
    }
  }

  private async construirDetallesFinales(
    manager: EntityManager,
    empresaId: string,
    detallesDto: any[]
  ): Promise<{ detallesFinales: any[]; subtotalCalculado: Decimal; ivaCalculado: Decimal; totalCalculado: Decimal }> {
    let subtotalCalculado = new Decimal(0);
    let ivaCalculado = new Decimal(0);
    let totalCalculado = new Decimal(0);
    const detallesFinales: any[] = [];

    for (const det of detallesDto) {
      const producto = await manager.findOne(Producto, {
        where: { id: det.productoId, empresaId }
      });

      if (!producto) throw new BadRequestException(`Producto ${det.productoId} no encontrado`);

      let precioReal = new Decimal(producto.precio);
      let notasFinales = det.notas || '';

      if (det.modificadoresIds && det.modificadoresIds.length > 0) {
        const modificadores = await manager.find(Modificadore, {
          where: { id: In(det.modificadoresIds), productoId: producto.id }
        });

        if (modificadores.length !== det.modificadoresIds.length) {
          throw new BadRequestException(`Uno o más modificadores no existen o no pertenecen al producto ${producto.nombre}`);
        }

        for (const mod of modificadores) {
          precioReal = precioReal.plus(mod.precioExtra);
          notasFinales += ` | + ${mod.nombre}`;
        }
      }

      const cantidad = new Decimal(det.cantidad);
      const totalLinea = precioReal.times(cantidad);
      
      const alicuota = 21;
      const divisor = new Decimal(1).plus(new Decimal(alicuota).dividedBy(100));
      const subtotalLinea = totalLinea.dividedBy(divisor);
      const ivaLinea = totalLinea.minus(subtotalLinea);

      totalCalculado = totalCalculado.plus(totalLinea);
      subtotalCalculado = subtotalCalculado.plus(subtotalLinea);
      ivaCalculado = ivaCalculado.plus(ivaLinea);

      const receta = await manager.find(Receta, {
        where: { productoId: producto.id }, relations: { insumo: true }
      });

      const recetaSnapshot = receta.length > 0
        ? receta.map(r => ({
            insumoId: r.insumo.id,
            nombre: r.insumo.nombre,
            cantidad: Number(r.cantidad)
          }))
        : [];

      detallesFinales.push({
        cantidad: det.cantidad,
        precioUnitario: precioReal.toNumber(),
        subtotal: subtotalLinea.toDecimalPlaces(2).toNumber(),
        alicuotaIva: alicuota,
        ivaTotal: ivaLinea.toDecimalPlaces(2).toNumber(),
        notas: notasFinales.trim(),
        productoId: producto.id,
        recetaSnapshot
      });
    }

    return { detallesFinales, subtotalCalculado, ivaCalculado, totalCalculado };
  }

  async create(createPedidoDto: CreatePedidoDto, usuarioId: string, empresaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (createPedidoDto.estado === 'ANULADO') {
        throw new BadRequestException('No se puede crear o modificar un pedido a ANULADO directamente.');
      }

      const { detallesFinales, subtotalCalculado, ivaCalculado, totalCalculado } = await this.construirDetallesFinales(
        queryRunner.manager,
        empresaId,
        createPedidoDto.detalles
      );

      let totalFinal = totalCalculado;
      if (createPedidoDto.costoEnvio) {
        totalFinal = totalFinal.plus(createPedidoDto.costoEnvio);
      }

      let pedidoGuardado;

      if (createPedidoDto.pedidoId) {
        const pedidoExistente = await queryRunner.manager.findOne(Pedido, {
          where: { id: createPedidoDto.pedidoId, empresaId },
          relations: { detalles: true }
        });

        if (!pedidoExistente) throw new NotFoundException('Pedido original no encontrado');
        
        if (pedidoExistente.estado !== 'ABIERTO') {
          throw new ConflictException('Solo se pueden modificar pedidos en estado ABIERTO');
        }

        await this.revertirStockPedido(queryRunner.manager, pedidoExistente);
        await queryRunner.manager.delete(PedidoDetalle, { pedidoId: pedidoExistente.id });

        const updateData: Partial<Pedido> = {
          subtotal: subtotalCalculado.toNumber(),
          ivaTotal: ivaCalculado.toNumber(),
          total: totalFinal.toNumber(),
          metodoPago: createPedidoDto.metodoPago || pedidoExistente.metodoPago,
          clienteId: createPedidoDto.clienteId || pedidoExistente.clienteId,
          mesaId: createPedidoDto.mesaId || pedidoExistente.mesaId,
        };

        if (createPedidoDto.mesaId && createPedidoDto.mesaId !== pedidoExistente.mesaId) {
          const mesaValida = await queryRunner.manager.findOne(Mesa, { where: { id: createPedidoDto.mesaId, empresaId } });
          if (!mesaValida) throw new BadRequestException('La mesa no pertenece a tu empresa');
        }

        const sucursalFinal = pedidoExistente.sucursalId || createPedidoDto.sucursalId;

        if (createPedidoDto.estado === 'PAGADO') {
          const cajaAbierta = await this.obtenerCajaAbiertaSucursal(queryRunner.manager, empresaId, sucursalFinal);
          if (!cajaAbierta) throw new BadRequestException('Debe abrir una caja para cobrar el pedido');
          
          updateData.cajaId = cajaAbierta.id;
          updateData.estado = 'PAGADO';

          if (updateData.mesaId) {
            await queryRunner.manager.update(Mesa, updateData.mesaId, { estado: 'LIBRE' });
          }
        }

        await queryRunner.manager.update(Pedido, pedidoExistente.id, updateData);

        for (const det of detallesFinales) {
          await this.descontarStock(queryRunner.manager, empresaId, det);
          await queryRunner.manager.save(PedidoDetalle, { ...det, pedidoId: pedidoExistente.id });
        }

        pedidoGuardado = await queryRunner.manager.findOne(Pedido, { 
          where: { id: pedidoExistente.id }, relations: { detalles: true } 
        });

      } else {
        const sucursalFinal = createPedidoDto.sucursalId || undefined;
        
        let cajaAbierta: Caja | null = null;
        if (createPedidoDto.estado === 'PAGADO') {
          cajaAbierta = await this.obtenerCajaAbiertaSucursal(queryRunner.manager, empresaId, sucursalFinal);
          if (!cajaAbierta) throw new BadRequestException('Debe abrir una caja para cobrar el pedido');
        }

        if (createPedidoDto.mesaId) {
          const mesaValida = await queryRunner.manager.findOne(Mesa, { where: { id: createPedidoDto.mesaId, empresaId } });
          if (!mesaValida) throw new BadRequestException('La mesa no pertenece a tu empresa');

          const nuevoEstadoMesa = createPedidoDto.estado === 'PAGADO' ? 'LIBRE' : 'OCUPADA';
          await queryRunner.manager.update(Mesa, createPedidoDto.mesaId, { estado: nuevoEstadoMesa });
        }

        for (const det of detallesFinales) {
          await this.descontarStock(queryRunner.manager, empresaId, det);
        }

        const pedidoNuevo = queryRunner.manager.create(Pedido, {
          subtotal: subtotalCalculado.toNumber(),
          ivaTotal: ivaCalculado.toNumber(),
          total: totalFinal.toNumber(),
          empresaId,
          sucursalId: sucursalFinal,
          estado: createPedidoDto.estado || 'PAGADO',
          estadoCocina: 'PENDIENTE',
          metodoPago: createPedidoDto.metodoPago || 'EFECTIVO',
          direccionEntrega: createPedidoDto.direccionEntrega || undefined,
          costoEnvio: createPedidoDto.costoEnvio || 0,
          estadoDelivery: createPedidoDto.direccionEntrega ? 'PENDIENTE' : 'NO_APLICA',
          mesaId: createPedidoDto.mesaId || undefined,
          clienteId: createPedidoDto.clienteId || undefined,
          cajaId: cajaAbierta ? cajaAbierta.id : undefined,
          detalles: detallesFinales as any
        } as any);

        pedidoGuardado = await queryRunner.manager.save(Pedido, pedidoNuevo);
      }

      await queryRunner.commitTransaction();

      await this.auditoriaService.registrar(
        empresaId, usuarioId, 'PEDIDO', pedidoGuardado.id, 'CREAR', null, { total: pedidoGuardado.total, estado: pedidoGuardado.estado }
      );

      return pedidoGuardado;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async anular(id: string, empresaId: string, motivo: string, usuarioId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pedido = await queryRunner.manager.findOne(Pedido, {
        where: { id, empresaId },
        relations: { detalles: true }
      });

      if (!pedido) throw new NotFoundException('Pedido no encontrado');
      if (pedido.estado === 'ANULADO') throw new BadRequestException('El pedido ya fue anulado');

      const estadoAnterior = pedido.estado;

      await this.revertirStockPedido(queryRunner.manager, pedido);

      if (pedido.mesaId) {
        await queryRunner.manager.update(Mesa, pedido.mesaId, { estado: 'LIBRE' });
      }

      pedido.estado = 'ANULADO';
      pedido.motivoAnulacion = motivo;
      pedido.usuarioAnulacionId = usuarioId;
      pedido.fechaAnulacion = new Date();

      const pedidoAnulado = await queryRunner.manager.save(Pedido, pedido);

      await queryRunner.commitTransaction();

      await this.auditoriaService.registrar(
        empresaId, usuarioId, 'PEDIDO', pedidoAnulado.id, 'ANULAR', { estado: estadoAnterior }, { estado: 'ANULADO' }, motivo
      );

      return pedidoAnulado;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(empresaId: string, sucursalId: string | null, page: number = 1, limit: number = 50) {
    const where: any = { empresaId };
    if (sucursalId) where.sucursalId = sucursalId;

    // Tope máximo de 100 registros por página para evitar colapsos
    const safeLimit = limit > 100 ? 100 : limit;

    return this.pedidoRepository.find({
      where,
      // Quitamos la entidad "empresa: true" para evitar fuga de datos y peso extra
      relations: { mesa: true, cliente: true, detalles: { producto: true } }, 
      order: { createdAt: 'DESC' },
      take: safeLimit,
      skip: (page - 1) * safeLimit
    });
  }

  findPendientesCocina(empresaId: string, sucursalId: string | null) {
    const query = sucursalId
      ? { empresaId, sucursalId, estadoCocina: 'PENDIENTE', estado: In(['ABIERTO', 'PAGADO']) }
      : { empresaId, estadoCocina: 'PENDIENTE', estado: In(['ABIERTO', 'PAGADO']) };
    return this.pedidoRepository.find({
      where: query,
      relations: { mesa: true, detalles: { producto: true } },
      order: { createdAt: 'ASC' }
    });
  }

  findDeliveryPendientes(empresaId: string, sucursalId: string | null) {
    const query = sucursalId
      ? { empresaId, sucursalId, estadoDelivery: 'PENDIENTE', estado: In(['ABIERTO', 'PAGADO']) }
      : { empresaId, estadoDelivery: 'PENDIENTE', estado: In(['ABIERTO', 'PAGADO']) };
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
    const payload: Partial<Pedido> = {};
    if (updatePedidoDto.estadoCocina !== undefined) payload.estadoCocina = updatePedidoDto.estadoCocina;
    if (updatePedidoDto.estadoDelivery !== undefined) payload.estadoDelivery = updatePedidoDto.estadoDelivery;
    if (Object.keys(payload).length === 0) {
      return { success: true, unchanged: true };
    }
    return this.pedidoRepository.update(id, payload);
  }

  async remove(id: string, empresaId: string, usuarioId?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pedido = await queryRunner.manager.findOne(Pedido, {
        where: { id, empresaId },
        relations: { detalles: true }
      });

      if (!pedido) throw new NotFoundException('Pedido no encontrado');
      
      if (pedido.estado === 'PAGADO') {
        throw new BadRequestException('No se puede borrar un pedido PAGADO. Use la anulación.');
      }

      if (pedido.estado !== 'ANULADO') {
        await this.revertirStockPedido(queryRunner.manager, pedido);
        if (pedido.mesaId) {
          await queryRunner.manager.update(Mesa, pedido.mesaId, { estado: 'LIBRE' });
        }
      }

      await queryRunner.manager.softDelete(Pedido, pedido.id);

      await queryRunner.commitTransaction();

      if (usuarioId) {
        await this.auditoriaService.registrar(
          empresaId, usuarioId, 'PEDIDO', pedido.id, 'BORRAR', { estado: pedido.estado, total: pedido.total }, null
        );
      }

      return { success: true };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAbiertoByMesa(mesaId: string, empresaId: string) {
    return this.pedidoRepository.findOne({
      where: { mesaId: mesaId, empresaId, estado: 'ABIERTO' },
      relations: { detalles: { producto: true } }
    });
  }
}