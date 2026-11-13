import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Receta } from '../recetas/entities/receta.entity'; // <-- NUEVO

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Receta])], // <-- AGREGADO
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}