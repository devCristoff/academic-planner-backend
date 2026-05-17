import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/src/app.module';
import { HttpExceptionFilter } from '@/src/common/filters/http-exception.filter';
import { DateTimeInterceptor } from '@/src/common/interceptors/datetime.interceptor';
import { RequestLoggingInterceptor } from '@/src/common/interceptors/request-logging.interceptor';
import { ResponseTransformInterceptor } from '@/src/common/interceptors/response-transform.interceptor';
import { DateUtils } from '@/src/common/utils/date.utils';

async function bootstrap() {
  // process.env.TZ = process.env.TZ ?? 'America/Santo_Domingo';

  // const prototype = Date.prototype as Date & { __localIsoOverride?: boolean };
  // if (!prototype.__localIsoOverride) {
  //   // eslint-disable-next-line no-extend-native
  //   Date.prototype.toISOString = function toISOStringLocal(): string {
  //     return DateUtils.toLocalString(this);
  //   };
  //   prototype.__localIsoOverride = true;
  // }

  const app = await NestFactory.create(AppModule);

  app.use((_req, res, next) => {
    res.setHeader('Date', DateUtils.toHttpDate());
    next();
  });

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
    new DateTimeInterceptor(),
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
