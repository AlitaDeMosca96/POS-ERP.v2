import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { MetricsService } from './metrics.service';
import { SuperAdminController } from './super-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Auditoria } from './entities/auditoria.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, Usuario, Pedido, Auditoria]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('FATAL ERROR: JWT_SECRET no está definido en el archivo .env');
        }
        return {
          secret: secret,
          signOptions: { expiresIn: '8h' },
        };
      },
    }),
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, MetricsService],
})
export class SuperAdminModule {}