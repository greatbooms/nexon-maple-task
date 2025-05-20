import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo'
import { AuthGuard, AuthModule, RolesGuard } from '@maple/shared'
import { EventModule } from './event/event.module'
import { EventPrismaModule } from '../prisma'
import { EventRewardModule } from './event-reward/event-reward.module'
import { UserEventParticipationHistoryModule } from './user-event-participation-history/user-event-participation-history.module'
import GraphQLJSON from 'graphql-type-json'
import { UserModule } from './user/user.module'
import { HealthController } from './heath.controller'
import { TerminusModule } from '@nestjs/terminus'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: {
          federation: 2,
          path: 'apps/event/src/prisma/event-schema.graphql',
        },
        resolvers: { JSON: GraphQLJSON },
        playground: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    EventPrismaModule,
    AuthModule,
    TerminusModule,

    EventModule,
    EventRewardModule,
    UserEventParticipationHistoryModule,
    UserModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
