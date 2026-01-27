import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // =========================
  // CONFIGURACIÓN CORS (FIX)
  // =========================
  const corsOrigins = configService
    .get<string>('CORS_ORIGIN')
    ?.split(',')
    .map(origin => origin.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      //if (corsOrigins?.includes(origin)) {
        return callback(null, true);
      //}

      return callback(new Error(`CORS no permitido: ${origin}`), false);
    },
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Transparencia Fiscal - Estado de Morelos')
    .setDescription('API para el sistema de gestión de proyectos de inversión y transparencia fiscal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
