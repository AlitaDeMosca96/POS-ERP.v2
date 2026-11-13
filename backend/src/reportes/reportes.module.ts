import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { PedidoDetalle } from '../pedidos/entities/pedido-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoDetalle])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}