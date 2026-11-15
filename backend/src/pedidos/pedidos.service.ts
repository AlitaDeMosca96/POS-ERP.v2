import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In, EntityManager } from 'typeorm';
import Decimal from 'decimal.js';
import { Pedido } from './entities/pedido.entity';
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

  private async obtenerCajaAbiertaSucursal(manager: EntityManager, empresaId: string, sucursalId?: string) {
    if (!sucursalId) return null;
    return manager.findOne(Caja, { where: { empresaId, sucursalId, estado: 'ABIERTA' } });
  }

  private async revertirStockPedido(manager: EntityManager, pedido: Pedido) {
    for (const det of pedido.detalles) {
      if (Array.isArray(det.recetaSnapshot)) {
        if (det.recetaSnapshot.length > 0) {
          for (const item of det.recetaSnapshot) {
            const cantidadADevolver = Number(item.cantidad) * det.cantidad;
            await manager.increment(Insumo, { id: item.insumoId }, 'stock', cantidadADevolver);
          }
        } else {
          await manager.increment(Producto, { id: det.producto.id }, 'stock', det.cantidad);
        }
      } else {
        const receta = await manager.find(Receta, {
          where: { producto: { id: det.producto.id } }, relations: { insumo: true }
        });
        if (receta.length > 0) {
          for (const item of receta) {
            const cantidadADevolver = Number(item.cantidad) * det.cantidad;
            await manager.increment(Insumo, { id: item.insumo.id }, 'stock', cantidadADevolver);
          }
        } else {
          await manager.increment(Producto, { id: det.producto.id }, 'stock', det.cantidad);
        }
      }
    }
  }

  private async descontarStock(manager: EntityManager, empresaId: string, det: any) {
    if (det.recetaSnapshot && det.recetaSnapshot.length > 0) {
      for (const item of det.recetaSnapshot) {
        const cantidadADescontar = Number(item.cantidad) * det.cantidad;
        const insumoActual = await manager.findOne(Insumo, { where: { id: item.insumoId } });
        if (!insumoActual || Number(insumoActual.stock) < cantidadADescontar) {
          throw new BadRequestException(`Stock insuficiente del insumo ${item.nombre}`);
        }
        await manager.decrement(Insumo, { id: item.insumoId }, 'stock', cantidadADescontar);
      }
    } else {
      const prodActual = await manager.findOne(Producto, { where: { id: det.producto.id, empresaId } });
      if (!prodActual || Number(prodActual.stock) < det.cantidad) {
        throw new BadRequestException(`Stock insuficiente del producto ${prodActual?.nombre}`);
      }
      await manager.decrement(Producto, { id: det.producto.id }, 'stock', det.cantidad);
    }
  }

  private async construirDetallesFinales(
    manager: EntityManager,
    empresaId: string,
    detallesDto: any[]
  ): Promise<{ detallesFinales: any[]; totalCalculado: Decimal }> {
    let totalCalculado = new Decimal(0);
    const detallesFinales = [];

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

      totalCalculado = totalCalculado.plus(precioReal.times(det.cantidad));

      const receta = await manager.find(Receta, {
        where: { producto: { id: producto.id } }, relations: { insumo: true }
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
        notas: notasFinales.trim(),
        producto: { id: producto.id },
        recetaSnapshot
      });
    }

    return { detallesFinales, totalCalculado };
  }

  async create(createPedidoDto: CreatePedidoDto, usuarioId: string, empresaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { detallesFinales, totalCalculado: subtotal } = await this.construirDetallesFinales(
        queryRunner.manager,
        empresaId,
        createPedidoDto.detalles
      );

      let totalCalculado = subtotal;
      if (createPedidoDto.costoEnvio) {
        totalCalculado = totalCalculado.plus(createPedidoDto.costoEnvio);
      }

      let numeroComprobante: string | undefined = undefined;
      let caeSimulado: string | undefined = undefined;

      if (createPedidoDto.tipoFactura !== 'FACTURA_B' && createPedidoDto.tipoFactura) {
        if (!createPedidoDto.cuitFactura || createPedidoDto.cuitFactura.length !== 11) {
          throw new BadRequestException('CUIT inválido para facturación');
        }

        const ultimoPedido = await queryRunner.manager.findOne(Pedido, {
          where: { empresaId, tipoFactura: createPedidoDto.tipoFactura },
          order: { createdAt: 'DESC' }
        });

        let secuencial = 1;
        if (ultimoPedido && ultimoPedido.numeroComprobante) {
          const partes = ultimoPedido.numeroComprobante.split('-');
          if (partes.length === 3) secuencial = parseInt(partes[2]) + 1;
        }

        const ptoVenta = '0001';
        const numeroStr = secuencial.toString().padStart(8, '0');
        numeroComprobante = `PV-${ptoVenta}-${numeroStr}`;
        caeSimulado = `CAE-${Date.now().toString().slice(-10)}`;
      }

      let pedidoGuardado;

      if (createPedidoDto.pedidoId) {
        const pedidoExistente = await queryRunner.manager.findOne(Pedido, {
          where: { id: createPedidoDto.pedidoId, empresaId },
          relations: { detalles: { producto: true } }
        });

        if (!pedidoExistente) throw new BadRequestException('Pedido original no encontrado');

        await this.revertirStockPedido(queryRunner.manager, pedidoExistente);

        await queryRunner.manager.delete('PedidoDetalle', { pedidoId: pedidoExistente.id });

        pedidoExistente.total = totalCalculado.toNumber();
        pedidoExistente.estado = createPedidoDto.estado || pedidoExistente.estado;
        pedidoExistente.metodoPago = createPedidoDto.metodoPago || pedidoExistente.metodoPago;
        pedidoExistente.tipoFactura = createPedidoDto.tipoFactura || pedidoExistente.tipoFactura;
        pedidoExistente.cuitFactura = createPedidoDto.cuitFactura || pedidoExistente.cuitFactura;
        pedidoExistente.razonSocialFactura = createPedidoDto.razonSocialFactura || pedidoExistente.razonSocialFactura;
        pedidoExistente.numeroComprobante = numeroComprobante || pedidoExistente.numeroComprobante;
        pedidoExistente.caeSimulado = caeSimulado || pedidoExistente.caeSimulado;

        if (createPedidoDto.mesaId) {
          const mesaValida = await queryRunner.manager.findOne(Mesa, { where: { id: createPedidoDto.mesaId, empresaId } });
          if (!mesaValida) throw new BadRequestException('La mesa no pertenece a tu empresa');
          pedidoExistente.mesaId = createPedidoDto.mesaId;
        }

        const sucursalFinal = pedidoExistente.sucursalId || createPedidoDto.sucursalId;

        if (pedidoExistente.estado === 'PAGADO') {
          const cajaAbierta = await this.obtenerCajaAbiertaSucursal(queryRunner.manager, empresaId, sucursalFinal);
          pedidoExistente.cajaId = cajaAbierta ? cajaAbierta.id : pedidoExistente.cajaId;

          if (pedidoExistente.mesaId) {
            const mesa = await queryRunner.manager.findOne(Mesa, { where: { id: pedidoExistente.mesaId, empresaId } });
            if (mesa) {
              await queryRunner.manager.update(Mesa, pedidoExistente.mesaId, { estado: 'LIBRE' });
            }
          }
        }

        for (const det of detallesFinales) {
          await this.descontarStock(queryRunner.manager, empresaId, det);
          await queryRunner.manager.save('PedidoDetalle', { ...det, pedidoId: pedidoExistente.id });
        }

        pedidoGuardado = await queryRunner.manager.save(Pedido, pedidoExistente);

      } else {
        const sucursalFinal = createPedidoDto.sucursalId || undefined;
        const cajaAbierta = await this.obtenerCajaAbiertaSucursal(queryRunner.manager, empresaId, sucursalFinal);

        if (createPedidoDto.mesaId) {
          const mesaValida = await queryRunner.manager.findOne(Mesa, { where: { id: createPedidoDto.mesaId, empresaId } });
          if (!mesaValida) throw new BadRequestException('La mesa no pertenece a tu empresa');

          if (createPedidoDto.estado === 'ABIERTO') {
            await queryRunner.manager.update(Mesa, createPedidoDto.mesaId, { estado: 'OCUPADA' });
          } else if (createPedidoDto.estado === 'PAGADO') {
            await queryRunner.manager.update(Mesa, createPedidoDto.mesaId, { estado: 'LIBRE' });
          }
        }

        for (const det of detallesFinales) {
          await this.descontarStock(queryRunner.manager, empresaId, det);
        }

        const pedidoNuevo = queryRunner.manager.create(Pedido, {
          total: totalCalculado.toNumber(),
          empresaId,
          sucursalId: sucursalFinal || undefined,
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
        relations: { detalles: { producto: true } }
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

    return this.pedidoRepository.find({
      where,
      relations: { empresa: true, mesa: true, cliente: true, detalles: { producto: true } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit
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
        relations: { detalles: { producto: true } }
      });

      if (!pedido) throw new NotFoundException('Pedido no encontrado');

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