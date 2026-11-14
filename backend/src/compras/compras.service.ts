import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { Insumo } from '../insumos/entities/insumo.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
    private readonly dataSource: DataSource, // <-- PARA TRANSACCIONES
  ) {}

  async create(createCompraDto: CreateCompraDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const det of createCompraDto.detalles) {
        const insumo = await queryRunner.manager.findOne(Insumo, {
          where: { id: det.insumoId, empresaId: createCompraDto.empresaId } // <-- VALIDACIÓN DE EMPRESA
        });

        if (!insumo) {
          throw new BadRequestException(`El insumo ${det.insumoId} no existe o no pertenece a tu empresa`);
        }

        // Actualizamos el stock y el costo de forma atómica
        insumo.stock = Number(insumo.stock) + Number(det.cantidad);
        insumo.costo = Number(det.costoUnitario);
        await queryRunner.manager.save(insumo);
      }

      const compra = queryRunner.manager.create(Compra, {
        total: createCompraDto.total,
        empresaId: createCompraDto.empresaId,
        proveedorId: createCompraDto.proveedorId,
        detalles: createCompraDto.detalles.map(det => ({
          cantidad: det.cantidad,
          costoUnitario: det.costoUnitario,
          insumo: { id: det.insumoId }
        }))
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