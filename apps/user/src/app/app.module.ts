import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo'
import { AuthGuard, AuthModule, RolesGuard } from '@maple/shared'
import { UserPrismaModule } from '../prisma'
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
          path: 'apps/user/src/prisma/user-schema.graphql',
        },
        playground: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    UserPrismaModule,
    AuthModule,

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
  controllers: [HealthController]
})
export class AppModule {}
