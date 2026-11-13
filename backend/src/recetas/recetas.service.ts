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
    const receta = this.recetaRepository.create(createRecetaDto);
    return this.recetaRepository.save(receta);
  }

  // Buscar todos los insumos de un producto específico
  findByProducto(productoId: string) {
    return this.recetaRepository.find({
      where: { productoId },
      relations: { insumo: true } // Traemos los datos del insumo (nombre, unidad, etc.)
    });
  }

  remove(id: string) {
    return this.recetaRepository.delete(id);
  }
}