import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { JwtModule } from '@nestjs/jwt'; // <-- NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, Usuario, Pedido]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mi_palabra_secreta_super_segura_123',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}