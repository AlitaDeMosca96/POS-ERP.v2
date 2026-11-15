import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plane.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [], // Acá irían tus controladores de planes si los tenés
  providers: [],   // Acá irían tus servicios de planes si los tenés
  exports: [TypeOrmModule] // Exportamos para que otros módulos puedan usar la entidad Plan
})
export class PlanesModule {}