import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { RequestHandler } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const swaggerCdn = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2';

  const defaultHelmet = helmet();

  const swaggerHelmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      },
    },
  });

  const securityHeaders: RequestHandler = (req, res, next) => {
    const middleware = req.path.startsWith('/docs')
      ? swaggerHelmet
      : defaultHelmet;

    return middleware(req, res, next);
  };

  app.use(securityHeaders);

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DevBoard API')
    .setDescription('REST API for DevBoard project and Kanban management')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'DevBoard API Documentation',
    customCssUrl: `${swaggerCdn}/swagger-ui.css`,
    customJs: [
      `${swaggerCdn}/swagger-ui-bundle.js`,
      `${swaggerCdn}/swagger-ui-standalone-preset.js`,
    ],
  });

  await app.listen(config.get<number>('PORT') ?? 3001);
}

void bootstrap();
