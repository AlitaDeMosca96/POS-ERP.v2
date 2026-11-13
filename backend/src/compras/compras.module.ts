import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Insumo } from '../insumos/entities/insumo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, CompraDetalle, Insumo])],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}