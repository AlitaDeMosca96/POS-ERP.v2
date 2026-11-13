import { Injectable } from '@nestjs/common';
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

  create(createRecetaDto: CreateRecetaDto) {
    const receta = this.recetaRepository.create({
      producto: { id: createRecetaDto.productoId },
      insumo: { id: createRecetaDto.insumoId },
      cantidad: createRecetaDto.cantidad
    });
    return this.recetaRepository.save(receta);
  }

  findByProducto(productoId: string) {
    return this.recetaRepository.find({
      where: { producto: { id: productoId } }, // <-- BUSCAMOS POR LA RELACIÓN
      relations: { insumo: true }
    });
  }

  remove(id: string) {
    return this.recetaRepository.delete(id);
  }
}