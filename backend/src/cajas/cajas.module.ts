import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';
import { Caja } from './entities/caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Caja, MovimientoCaja, Pedido, Sucursal])],
  controllers: [CajasController],
  providers: [CajasService],
  exports: [CajasService]
})
export class CajasModule {}