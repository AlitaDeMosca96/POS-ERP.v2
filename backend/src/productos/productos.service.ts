import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  create(createProductoDto: CreateProductoDto) {
    const producto = this.productoRepository.create(createProductoDto);
    return this.productoRepository.save(producto);
  }

  findAll(empresaId: string) {
    return this.productoRepository.find({ 
      where: { empresaId },
      relations: { empresa: true } 
    });
  }

  findOne(id: string) {
    return this.productoRepository.findOne({ 
      where: { id },
      relations: { empresa: true }
    });
  }

  update(id: string, updateProductoDto: UpdateProductoDto) {
    return this.productoRepository.update(id, updateProductoDto);
  }

  remove(id: string) {
    return this.productoRepository.delete(id);
  }
}