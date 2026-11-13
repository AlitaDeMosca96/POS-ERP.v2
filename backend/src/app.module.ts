import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmpresasModule } from './empresas/empresas.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { MesasModule } from './mesas/mesas.module';
import { CajasModule } from './cajas/cajas.module';
import { InsumosModule } from './insumos/insumos.module';
import { RecetasModule } from './recetas/recetas.module'; // <-- NUEVA LÍNEA

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'pos-erp-v2',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    EmpresasModule,
    SucursalesModule,
    UsuariosModule,
    ProductosModule,
    PedidosModule,
    CategoriasModule,
    MesasModule,
    CajasModule,
    InsumosModule,
    RecetasModule, // <-- NUEVA LÍNEA
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}