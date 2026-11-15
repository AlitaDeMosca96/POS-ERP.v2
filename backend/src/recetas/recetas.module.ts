import { Module } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receta } from './entities/receta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Insumo } from '../insumos/entities/insumo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receta, Producto, Insumo])],
  controllers: [RecetasController],
  providers: [RecetasService],
  exports: [RecetasService],
})
export class RecetasModule {}