import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Forzamos CORS para evitar bloqueos del navegador
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Escuchamos en 0.0.0.0 para evitar el problema de IPv6/IPv4 en Windows
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();