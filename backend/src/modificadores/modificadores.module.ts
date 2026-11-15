import { Module } from '@nestjs/common';
import { ModificadoresService } from './modificadores.service';
import { ModificadoresController } from './modificadores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modificadore } from './entities/modificadore.entity';
import { Producto } from '../productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Modificadore, Producto])],
  controllers: [ModificadoresController],
  providers: [ModificadoresService],
})
export class ModificadoresModule {}