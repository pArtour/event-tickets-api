import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { join } from 'path';
import { GraphqlConfig } from 'src/common/configs/config.interface';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createGqlOptions() {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql');

    return {
      // schema options
      autoSchemaFile:
        graphqlConfig.schemaDestination ||
        join(process.cwd(), 'src/schema.graphql'),
      sortSchema: graphqlConfig.sortSchema,
      buildSchemaOptions: {
        numberScalarMode: 'integer' as const,
        directives: [
          new GraphQLDirective({
            name: 'upper',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
      // subscription
      installSubscriptionHandlers: true,
      debug: graphqlConfig.debug,
      playground: graphqlConfig.playgroundEnabled,
      context: ({ req }) => ({ req }),
    };
  }
}
