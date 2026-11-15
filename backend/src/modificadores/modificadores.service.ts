import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModificadoreDto } from './dto/create-modificadore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modificadore } from './entities/modificadore.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class ModificadoresService {
  constructor(
    @InjectRepository(Modificadore)
    private readonly modificadorRepository: Repository<Modificadore>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createModificadoreDto: CreateModificadoreDto, empresaId: string) {
    // Validamos que el producto al que se le asigna el modificador sea de la empresa
    const producto = await this.productoRepository.findOne({ 
      where: { id: createModificadoreDto.productoId, empresaId } 
    });
    
    if (!producto) throw new NotFoundException('Producto no encontrado o no pertenece a tu empresa');

    const modificador = this.modificadorRepository.create({
      nombre: createModificadoreDto.nombre,
      precioExtra: createModificadoreDto.precioExtra,
      producto: { id: createModificadoreDto.productoId }
    });
    
    return this.modificadorRepository.save(modificador);
  }

  async findByProducto(productoId: string, empresaId: string) {
    return this.modificadorRepository.find({ 
      where: { 
        producto: { id: productoId, empresaId }
      } 
    });
  }

  async remove(id: string, empresaId: string) {
    // Validamos que el modificador pertenezca a un producto de la empresa
    const modificador = await this.modificadorRepository.findOne({
      where: { id, producto: { empresaId } },
      relations: { producto: true }
    });

    if (!modificador) throw new NotFoundException('Modificador no encontrado');

    return this.modificadorRepository.delete(id);
  }
}