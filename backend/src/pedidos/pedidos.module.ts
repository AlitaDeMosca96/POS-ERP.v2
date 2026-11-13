import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { Insumo } from '../insumos/entities/insumo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, PedidoDetalle, Producto, Mesa, Caja, Receta, Insumo])
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}