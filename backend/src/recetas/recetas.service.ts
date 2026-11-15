import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Insumo } from '../insumos/entities/insumo.entity';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,
  ) {}

  async create(createRecetaDto: CreateRecetaDto, empresaId: string) {
    // Validamos que el producto sea de la empresa
    const producto = await this.productoRepository.findOne({ 
      where: { id: createRecetaDto.productoId, empresaId } 
    });
    if (!producto) throw new NotFoundException('Producto no encontrado o no pertenece a tu empresa');

    // Validamos que el insumo sea de la empresa
    const insumo = await this.insumoRepository.findOne({ 
      where: { id: createRecetaDto.insumoId, empresaId } 
    });
    if (!insumo) throw new NotFoundException('Insumo no encontrado o no pertenece a tu empresa');

    const receta = this.recetaRepository.create({
      producto: { id: createRecetaDto.productoId },
      insumo: { id: createRecetaDto.insumoId },
      cantidad: createRecetaDto.cantidad
    });
    return this.recetaRepository.save(receta);
  }

  async findByProducto(productoId: string, empresaId: string) {
    return this.recetaRepository.find({
      where: { 
        producto: { id: productoId, empresaId }
      },
      relations: { insumo: true }
    });
  }

  async remove(id: string, empresaId: string) {
    // Buscamos la receta asegurándonos de que el producto asociado sea de la empresa
    const receta = await this.recetaRepository.findOne({
      where: { id, producto: { empresaId } },
      relations: { producto: true }
    });
    
    if (!receta) throw new NotFoundException('Receta no encontrada');
    
    return this.recetaRepository.delete(id);
  }
}