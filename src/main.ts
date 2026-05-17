import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/src/app.module';
import { HttpExceptionFilter } from '@/src/common/filters/http-exception.filter';
import { RequestLoggingInterceptor } from '@/src/common/interceptors/request-logging.interceptor';
import { ResponseTransformInterceptor } from '@/src/common/interceptors/response-transform.interceptor';

async function bootstrap() {
  console.log('Date.toString():', new Date().toString());
  console.log('Date.toISOString():', new Date().toISOString());
  console.log('Current Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);


  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(
    new RequestLoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Academic Planner API')
    .setDescription('API documentation for Academic Planner backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT') ?? 3000;
  await app.listen(port);
}

void bootstrap();
