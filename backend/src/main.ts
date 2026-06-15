import { otelSDK } from './tracing';
// Start OpenTelemetry SDK before NestJS boots
otelSDK.start();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    { bufferLogs: true }
  );

  // 0. Use Pino for logging
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API prefix
  app.setGlobalPrefix('api');

  // 1. Global Validation Pipe setup
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 2. Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Restaurant Digital Menu API')
    .setDescription('Multi-tenant SaaS API documentation for order and menu management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  // Serve swagger at /api/docs (since global prefix is 'api', just 'docs' here)
  SwaggerModule.setup('api/docs', app, document);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    server.use(express.static(distPath));
    server.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await app.listen(3000, "0.0.0.0");
}
bootstrap();
