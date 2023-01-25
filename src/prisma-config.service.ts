import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  loggingMiddleware,
  PrismaOptionsFactory,
  PrismaServiceOptions,
  QueryInfo,
} from 'nestjs-prisma';

@Injectable()
export class PrismaConfigService implements PrismaOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  public createPrismaOptions(): PrismaServiceOptions {
    const loggerCongig = this.configService.get('logger');

    return {
      middlewares: [
        loggingMiddleware({
          logger: new Logger('PrismaMiddleware'),
          logLevel: loggerCongig.level,
          logMessage: (query: QueryInfo) =>
            `[Prisma Query] ${query.model}.${query.action} - ${query.executionTime}ms`,
        }),
      ],
    };
  }
}
