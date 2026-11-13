import { Injectable } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { Insumo } from '../insumos/entities/insumo.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
  ) {}

  async create(createCompraDto: CreateCompraDto) {
    // 1. Actualizamos el stock y el costo de cada insumo
    for (const det of createCompraDto.detalles) {
      const insumo = await this.insumoRepository.findOneBy({ id: det.insumoId });
      if (insumo) {
        insumo.stock = Number(insumo.stock) + Number(det.cantidad);
        insumo.costo = Number(det.costoUnitario); // Actualizamos al último costo
        await this.insumoRepository.save(insumo);
      }
    }

    // 2. Guardamos la compra (cabecera y detalles)
    const compra = this.compraRepository.create({
      total: createCompraDto.total,
      empresaId: createCompraDto.empresaId,
      proveedorId: createCompraDto.proveedorId,
      detalles: createCompraDto.detalles.map(det => ({
        cantidad: det.cantidad,
        costoUnitario: det.costoUnitario,
        insumo: { id: det.insumoId }
      }))
    });
    
    return this.compraRepository.save(compra);
  }

  findAll(empresaId: string) {
    return this.compraRepository.find({ 
      where: { empresaId },
      relations: { proveedor: true, detalles: { insumo: true } },
      order: { fecha: 'DESC' }
    });
  }
}