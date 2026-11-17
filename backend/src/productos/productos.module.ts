import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { MovimientoStock } from '../stock/entities/movimiento-stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Receta, MovimientoStock])],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}