import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// IMPORTACIÓN DE TODOS TUS MÓDULOS
import { AuthModule } from './auth/auth.module';
import { CajasModule } from './cajas/cajas.module';
import { CampaniasModule } from './campanias/campanias.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ClientesModule } from './clientes/clientes.module';
import { ComprasModule } from './compras/compras.module';
import { EmpresasModule } from './empresas/empresas.module';
import { InsumosModule } from './insumos/insumos.module';
import { MesasModule } from './mesas/mesas.module';
import { ModificadoresModule } from './modificadores/modificadores.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PlanesModule } from './planes/planes.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { RecetasModule } from './recetas/recetas.module';
import { ReportesModule } from './reportes/reportes.module';
import { ReservasModule } from './reservas/reservas.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // PROTECCIÓN CONTRA FUERZA BRUTA (100 peticiones por minuto por IP)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'pos_erp',
      autoLoadEntities: true, 
      synchronize: true, // Se mantiene por ahora hasta implementar migraciones
    }),
    
    AuthModule, CajasModule, CampaniasModule, CategoriasModule, ClientesModule,
    ComprasModule, EmpresasModule, InsumosModule, MesasModule, ModificadoresModule,
    PedidosModule, PlanesModule, ProductosModule, ProveedoresModule, RecetasModule,
    ReportesModule, ReservasModule, SucursalesModule, SuperAdminModule, UsuariosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Aplica el límite de peticiones a nivel global
    }
  ],
})
export class AppModule {}