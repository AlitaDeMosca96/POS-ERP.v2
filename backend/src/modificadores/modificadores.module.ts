import { Module } from '@nestjs/common';
import { ModificadoresService } from './modificadores.service';
import { ModificadoresController } from './modificadores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modificadore } from './entities/modificadore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Modificadore])],
  controllers: [ModificadoresController],
  providers: [ModificadoresService],
})
export class ModificadoresModule {}