import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { Insumo } from './entities/insumo.entity';
import { MovimientoStock } from '../stock/entities/movimiento-stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Insumo, MovimientoStock])],
  controllers: [InsumosController],
  providers: [InsumosService],
  exports: [InsumosService],
})
export class InsumosModule {}