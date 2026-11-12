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
    // ACÁ ESTÁ EL ARREGLO: Armamos la relación correctamente
    const producto = this.productoRepository.create({
      nombre: createProductoDto.nombre,
      precio: createProductoDto.precio,
      costo: createProductoDto.costo,
      stock: createProductoDto.stock,
      empresaId: createProductoDto.empresaId,
      categoria: createProductoDto.categoriaId ? { id: createProductoDto.categoriaId } : undefined
    });
    
    return this.productoRepository.save(producto);
  }

  findAll(empresaId: string) {
    return this.productoRepository.find({ 
      where: { empresaId },
      relations: { empresa: true, categoria: true } 
    });
  }

  findOne(id: string) {
    return this.productoRepository.findOne({ 
      where: { id },
      relations: { empresa: true, categoria: true }
    });
  }

  update(id: string, updateProductoDto: UpdateProductoDto) {
    return this.productoRepository.update(id, updateProductoDto);
  }

  remove(id: string) {
    return this.productoRepository.delete(id);
  }
}