import { Module } from '@nestjs/common';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caja } from './entities/caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { Pedido } from '../pedidos/entities/pedido.entity'; // <-- NUEVO

@Module({
  imports: [TypeOrmModule.forFeature([Caja, MovimientoCaja, Pedido])], // <-- AGREGADO
  controllers: [CajasController],
  providers: [CajasService],
})
export class CajasModule {}