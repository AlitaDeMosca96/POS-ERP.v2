import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createProductoDto: CreateProductoDto) {
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

    for (const prod of productos) {
      const receta = await this.recetaRepository.find({
        where: { producto: { id: prod.id } },
        relations: { insumo: true }
      });

      if (receta.length > 0) {
        let maxPosible = Infinity;
        for (const item of receta) {
          const disponible = Math.floor(item.insumo.stock / Number(item.cantidad));
          if (disponible < maxPosible) maxPosible = disponible;
        }
        prod.stock = maxPosible === Infinity ? 0 : maxPosible;
      }
    }
    return productos;
  }

  async findOne(id: string, empresaId: string) {
    const producto = await this.productoRepository.findOne({ 
      where: { id, empresaId }, // <-- VALIDACIÓN MULTI-TENANT
      relations: { empresa: true, categoria: true }
    });
    if (!producto) throw new NotFoundException('Producto no encontrado o no pertenece a tu empresa');
    return producto;
  }

  async update(id: string, updateProductoDto: UpdateProductoDto, empresaId: string) {
    await this.findOne(id, empresaId); // Valida que exista y sea de la empresa
    return this.productoRepository.update(id, updateProductoDto);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.productoRepository.delete(id);
  }
}