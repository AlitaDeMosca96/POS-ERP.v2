import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity'; // <-- Importamos

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoDetalle, Producto, Mesa])], // <-- Agregamos Mesa
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}