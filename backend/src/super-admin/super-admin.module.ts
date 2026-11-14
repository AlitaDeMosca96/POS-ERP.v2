import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { MetricsService } from './metrics.service'; // <-- NUEVO
import { SuperAdminController } from './super-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Auditoria } from './entities/auditoria.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, Usuario, Pedido, Auditoria]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mi_palabra_secreta_super_segura_123',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, MetricsService], // <-- REGISTRAMOS EL NUEVO SERVICIO
})
export class SuperAdminModule {}