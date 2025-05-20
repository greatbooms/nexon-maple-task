import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from './generated/client'

@Injectable()
export class EventPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPrismaService.name)

  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    })
    this.logger.log('PrismaService instantiated')
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('PrismaService connected to the database')
    } catch (error) {
      this.logger.error('Failed to connect to the database', error)
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('PrismaService disconnected from the database')
  }
}
