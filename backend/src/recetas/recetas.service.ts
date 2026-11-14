import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
  ) {}

  async create(createRecetaDto: CreateRecetaDto) {
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
        producto: { id: productoId, empresaId } // <-- VALIDA QUE EL PRODUCTO SEA DE LA EMPRESA
      },
      relations: { insumo: true }
    });
  }

  async remove(id: string) {
    return this.recetaRepository.delete(id);
  }
}