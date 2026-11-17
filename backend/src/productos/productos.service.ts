import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { MovimientoStock } from '../stock/entities/movimiento-stock.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
    @InjectRepository(MovimientoStock)
    private readonly movimientoStockRepository: Repository<MovimientoStock>,
  ) {}

  async create(createProductoDto: CreateProductoDto) {
    const producto = this.productoRepository.create({
      nombre: createProductoDto.nombre,
      precio: createProductoDto.precio,
      costo: createProductoDto.costo,
      stock: createProductoDto.stock,
      controlaStock: createProductoDto.controlaStock ?? true,
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

    const recetas = await this.recetaRepository.createQueryBuilder('receta')
      .leftJoinAndSelect('receta.producto', 'producto')
      .leftJoinAndSelect('receta.insumo', 'insumo')
      .where('producto.empresaId = :empresaId', { empresaId })
      .getMany();

    const recetasPorProducto = recetas.reduce((acc, receta) => {
      if (!acc[receta.producto.id]) acc[receta.producto.id] = [];
      acc[receta.producto.id].push(receta);
      return acc;
    }, {} as Record<string, Receta[]>);

    for (const prod of productos) {
      if (!prod.controlaStock) {
        prod.stock = 9999; // Simulamos stock infinito para los que no controlan
        continue;
      }
      
      const receta = recetasPorProducto[prod.id] || [];
      if (receta.length > 0) {
        let maxPosible = Infinity;
        for (const item of receta) {
          if (!item.insumo.controlaStock) continue; // Ignoramos insumos que no controlan stock
          const disponible = Math.floor(item.insumo.stock / Number(item.cantidad));
          if (disponible < maxPosible) maxPosible = disponible;
        }
        prod.stock = maxPosible === Infinity ? prod.stock : maxPosible; 
      }
    }
    return productos;
  }

  async findOne(id: string, empresaId: string) {
    const producto = await this.productoRepository.findOne({ 
      where: { id, empresaId },
      relations: { empresa: true, categoria: true }
    });
    if (!producto) throw new NotFoundException('Producto no encontrado o no pertenece a tu empresa');
    return producto;
  }

  async update(id: string, updateProductoDto: UpdateProductoDto, empresaId: string, usuarioId: string) {
    const producto = await this.findOne(id, empresaId);
    const { motivoAjuste, ...datosAActualizar } = updateProductoDto;

    if (datosAActualizar.stock !== undefined && Number(datosAActualizar.stock) !== Number(producto.stock)) {
      if (!motivoAjuste) {
        throw new BadRequestException('Debe proveer un motivo para ajustar el stock.');
      }
      
      const diferencia = Number(datosAActualizar.stock) - Number(producto.stock);

      await this.movimientoStockRepository.save({
        empresaId,
        productoId: id,
        usuarioId,
        tipo: diferencia > 0 ? 'ENTRADA' : 'SALIDA',
        cantidad: Math.abs(diferencia),
        stockResultante: datosAActualizar.stock,
        motivo: motivoAjuste,
      });
    }

    return this.productoRepository.update(id, datosAActualizar);
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);
    return this.productoRepository.softDelete(id);
  }
}