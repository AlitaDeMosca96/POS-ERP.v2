import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3001', '/api'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validación Global Estricta
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina campos extra
    forbidNonWhitelisted: true, // Tira error si mandan campos que no están en el DTO
    transform: true, // Transforma a los tipos correctos
  }));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();