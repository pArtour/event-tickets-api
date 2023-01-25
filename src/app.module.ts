import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from 'nestjs-prisma';
import { AuthModule } from 'src/auth/auth.module';
import { EventModule } from 'src/event/event.module';
import { UserModule } from 'src/user/user.module';
import { ComplexityPlugin } from 'src/common/plugins/complexity.plugin';
import { GqlConfigService } from 'src/gql-config.service';
import config from 'src/common/configs/config';
import { PrismaConfigService } from 'src/prisma-config.service';
import { TicketModule } from './ticket/ticket.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useClass: PrismaConfigService,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlConfigService,
    }),
    AuthModule,
    UserModule,
    EventModule,
    TicketModule,
    LocationModule,
  ],
  providers: [ComplexityPlugin],
})
export class AppModule {}
