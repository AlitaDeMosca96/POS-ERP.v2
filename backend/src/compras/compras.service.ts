import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Decimal from 'decimal.js'; // <-- NUEVO
import { Compra } from './entities/compra.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { Proveedore } from '../proveedores/entities/proveedore.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompraDto: CreateCompraDto, empresaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proveedor = await queryRunner.manager.findOne(Proveedore, {
        where: { id: createCompraDto.proveedorId, empresaId }
      });
      if (!proveedor) throw new NotFoundException('Proveedor no encontrado o no pertenece a tu empresa');

      let totalCalculado = new Decimal(0); // <-- DECIMAL
      const detallesParaGuardar = [];

      for (const det of createCompraDto.detalles) {
        const insumo = await queryRunner.manager.findOne(Insumo, {
          where: { id: det.insumoId, empresaId }
        });

        if (!insumo) {
          throw new BadRequestException(`El insumo ${det.insumoId} no existe o no pertenece a tu empresa`);
        }

        // Sumar al total de la compra
        totalCalculado = totalCalculado.plus(new Decimal(det.cantidad).times(det.costoUnitario));

        // Calcular Costo Promedio Ponderado (CPP) con Decimal
        const stockActual = new Decimal(insumo.stock);
        const costoActual = new Decimal(insumo.costo);
        const cantidadNueva = new Decimal(det.cantidad);
        const costoNuevo = new Decimal(det.costoUnitario);

        const valorTotalActual = stockActual.times(costoActual);
        const valorTotalNuevo = cantidadNueva.times(costoNuevo);
        
        const nuevoStock = stockActual.plus(cantidadNueva);
        insumo.stock = nuevoStock.toNumber();
        
        if (nuevoStock.greaterThan(0)) {
          insumo.costo = valorTotalActual.plus(valorTotalNuevo).dividedBy(nuevoStock).toNumber();
        } else {
          insumo.costo = costoNuevo.toNumber();
        }

        await queryRunner.manager.save(insumo);

        detallesParaGuardar.push({
          cantidad: cantidadNueva.toNumber(),
          costoUnitario: costoNuevo.toNumber(),
          insumo: { id: insumo.id }
        });
      }

      const compra = queryRunner.manager.create(Compra, {
        total: totalCalculado.toNumber(), // <-- ASIGNAMOS COMO NUMBER
        empresaId,
        proveedorId: createCompraDto.proveedorId,
        detalles: detallesParaGuardar as any
      });
      
      const compraGuardada = await queryRunner.manager.save(compra);
      
      await queryRunner.commitTransaction();
      return compraGuardada;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(empresaId: string) {
    return this.compraRepository.find({ 
      where: { empresaId },
      relations: { proveedor: true, detalles: { insumo: true } },
      order: { fecha: 'DESC' }
    });
  }
}