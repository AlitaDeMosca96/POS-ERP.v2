import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Seguridad HTTP
  app.use(helmet());

  // Configuración de CORS flexible
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3001', 'http://localhost:3000'];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true, 
    forbidNonWhitelisted: true, // Rechaza campos extra que no estén en el DTO
  }));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();