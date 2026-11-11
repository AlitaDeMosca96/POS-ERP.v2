import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoDetalle])],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}