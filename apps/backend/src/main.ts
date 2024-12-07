import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { CustomLoggerService } from './logging/logger.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Crear aplicación
  const app = await NestFactory.create(AppModule);

  // Obtener servicios
  const configService = app.get(ConfigService);
  const logger = app.get(CustomLoggerService);

  // Middleware para cookies
  app.use(cookieParser());

  // Helmet para seguridad
  app.use(
    helmet({
      contentSecurityPolicy: configService.get<boolean>(
        'helmet.contentSecurityPolicy',
      )
        ? undefined
        : false,
      frameguard: configService.get<boolean>('helmet.frameguard')
        ? {
            action: configService.get<'deny' | 'sameorigin'>(
              'helmet.frameguardAction',
            ),
          }
        : false,
      hidePoweredBy: configService.get<boolean>('helmet.hidePoweredBy'),
      hsts: configService.get<boolean>('helmet.hsts')
        ? {
            maxAge: configService.get<number>('helmet.hstsMaxAge'),
            includeSubDomains: configService.get<boolean>(
              'helmet.hstsIncludeSubDomains',
            ),
          }
        : false,
      ieNoOpen: configService.get<boolean>('helmet.ieNoOpen'),
      noSniff: configService.get<boolean>('helmet.noSniff'),
      xssFilter: configService.get<boolean>('helmet.xssFilter'),
    }),
  );

  // Configuración global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Inicializar métricas de Prometheus
  const register = new Registry();
  collectDefaultMetrics({ register });
  console.log('Prometheus metrics initialized.');

  // Configuración de Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  console.log('Swagger setup completed.');

  // Configuración global de manejo de excepciones
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useLogger(logger);

  // Habilitar CORS (opcional, dependiendo de tus necesidades)
  app.enableCors();

  // Iniciar servidor
  const port = configService.get<number>('port', 4000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
