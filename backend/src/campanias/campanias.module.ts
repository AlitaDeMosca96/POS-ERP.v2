import { Module } from '@nestjs/common';
import { CampaniasService } from './campanias.service';
import { CampaniasController } from './campanias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campania } from './entities/campania.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campania, Cliente])],
  controllers: [CampaniasController],
  providers: [CampaniasService],
})
export class CampaniasModule {}