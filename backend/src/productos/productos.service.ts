import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Receta } from '../recetas/entities/receta.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
  ) {}

  create(createProductoDto: CreateProductoDto) {
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

  async findAll(empresaId: string) {
    const productos = await this.productoRepository.find({ 
      where: { empresaId },
      relations: { empresa: true, categoria: true } 
    });

    // --- CÁLCULO DE STOCK DINÁMICO ---
    for (const prod of productos) {
      const receta = await this.recetaRepository.find({
        where: { producto: { id: prod.id } },
        relations: { insumo: true }
      });

      if (receta.length > 0) {
        let maxPosible = Infinity;
        for (const item of receta) {
          // Calculamos cuántos platos se pueden hacer con este insumo
          const disponible = Math.floor(item.insumo.stock / Number(item.cantidad));
          if (disponible < maxPosible) {
            maxPosible = disponible;
          }
        }
        // El stock del producto pasa a ser el máximo posible según sus insumos
        prod.stock = maxPosible === Infinity ? 0 : maxPosible;
      }
    }

    return productos;
  }

  async findOne(id: string) {
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