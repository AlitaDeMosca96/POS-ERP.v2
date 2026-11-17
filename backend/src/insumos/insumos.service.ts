import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from './entities/insumo.entity';
import { MovimientoStock } from '../stock/entities/movimiento-stock.entity';

@Injectable()
export class InsumosService {
  constructor(
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
    @InjectRepository(MovimientoStock)
    private readonly movimientoStockRepository: Repository<MovimientoStock>,
  ) {}

  create(createInsumoDto: CreateInsumoDto) {
    const insumo = this.insumoRepository.create(createInsumoDto);
    return this.insumoRepository.save(insumo);
  }

  findAll(empresaId: string) {
    return this.insumoRepository.find({ where: { empresaId }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string, empresaId: string) {
    const insumo = await this.insumoRepository.findOneBy({ id, empresaId });
    if (!insumo) throw new NotFoundException('Insumo no encontrado');
    return insumo;
  }

  async update(id: string, updateInsumoDto: UpdateInsumoDto, empresaId: string, usuarioId: string) {
    const insumo = await this.findOne(id, empresaId);
    const { motivoAjuste, ...datosAActualizar } = updateInsumoDto;

    // Si se está intentando cambiar el stock, exigimos motivo
    if (datosAActualizar.stock !== undefined && Number(datosAActualizar.stock) !== Number(insumo.stock)) {
      if (!motivoAjuste) {
        throw new BadRequestException('Debe proveer un motivo para ajustar el stock.');
      }
      
      const diferencia = Number(datosAActualizar.stock) - Number(insumo.stock);

      await this.movimientoStockRepository.save({
        empresaId,
        insumoId: id,
        usuarioId,
        tipo: diferencia > 0 ? 'ENTRADA' : 'SALIDA',
        cantidad: Math.abs(diferencia),
        stockResultante: datosAActualizar.stock,
        motivo: motivoAjuste,
      });
    }

    return this.insumoRepository.update(id, datosAActualizar);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.insumoRepository.softDelete(id);
  }
}