import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  create(createCategoriaDto: CreateCategoriaDto) {
    const categoria = this.categoriaRepository.create(createCategoriaDto);
    return this.categoriaRepository.save(categoria);
  }

  findAll(empresaId: string) {
    return this.categoriaRepository.find({ where: { empresaId } });
  }

  async findOne(id: string, empresaId: string) {
    const cat = await this.categoriaRepository.findOneBy({ id, empresaId });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.categoriaRepository.update(id, updateCategoriaDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.categoriaRepository.softDelete(id); // <-- SOFT DELETE
  }
}