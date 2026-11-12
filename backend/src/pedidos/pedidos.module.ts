import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Caja } from '../cajas/entities/caja.entity'; // <-- IMPORTAMOS CAJA

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoDetalle, Producto, Mesa, Caja])], // <-- LA AGREGAMOS ACÁ
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}