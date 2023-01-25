import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaClientExceptionFilter, PrismaService } from 'nestjs-prisma';

import { AppModule } from 'src/app.module';
import { NestConfig, CorsConfig } from 'src/common/configs/config.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // enable shutdown hook
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Prisma Client Exception Filter for unhandled exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter, {
      // Prisma Error Code: HTTP Status Response
      P2000: HttpStatus.BAD_REQUEST, // The provided value for the column is too long for the column’s type. Column: {column_name}
      P2002: HttpStatus.CONFLICT, // Unique constraint failed on the {constraint}
      P2025: HttpStatus.NOT_FOUND, // An operation failed because it depends on one or more records that were required but not found. {cause}
    }),
  );

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');

  // Cors
  if (corsConfig.enabled) {
    app.enableCors();
  }

  await app.listen(process.env.PORT || nestConfig.port || 3000);
}
bootstrap();
