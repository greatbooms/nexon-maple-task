import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo'
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway'
import { Request } from 'express'

interface ConnectionContext {
  context: any
}

interface ContextParams {
  req?: Request
  connection?: ConnectionContext
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const userServiceUrl = configService.get<string>('USER_SERVICE_URL')
        const eventServiceUrl = configService.get<string>('EVENT_SERVICE_URL')

        return {
          server: {
            context: ({ req, connection }: ContextParams) => {
              // 공통적으로 사용되는 context
              // 웹소켓용 context
              if (connection) {
                return { req: connection.context }
              }
              // HTTP용 context
              return {
                jwt: req?.headers.authorization,
                req,
              }
            },
            cors: true,
          },
          gateway: {
            supergraphSdl: new IntrospectAndCompose({
              subgraphs: [{ name: 'users', url: userServiceUrl }, { name: 'events', url: eventServiceUrl }],
            }),
            buildService({ url }) {
              return new RemoteGraphQLDataSource({
                url,
                willSendRequest({ request, context }) {
                  if (context.req?.headers?.authorization) {
                    request.http?.headers.set('Authorization', context.req.headers.authorization)
                  }
                  // console.log('context.req.headers.authorization', context.req.headers.authorization)
                  if (context.req?.user?.id) {
                    request.http?.headers.set('user-id', context.req.user.id)
                  }
                  // console.log('context.req.user.id', context.req.user.id)
                  if (context.req?.user?.role) {
                    request.http?.headers.set('user-role', context.req.user.role)
                  }
                  // console.log('context.req.user.role', context.req.user.role)
                },
              })
            },
          },
          playground: configService.get<string>('NODE_ENV') !== 'production',
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
})
export class AppModule {}
