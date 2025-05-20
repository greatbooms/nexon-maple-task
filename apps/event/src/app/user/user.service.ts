import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { USER_PATTERNS } from '@maple/shared'

@Injectable()
export class UserService {
  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientProxy) {}

  private readonly logger = new Logger(UserService.name)

  async getUserInviteCount(userId: string, startAt: Date, endAt: Date): Promise<number> {
    try {
      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.GET_USER_INVITE_COUNT, {
          userId,
          startAt,
          endAt,
        }),
      )
    } catch (error) {
      this.logger.error(`Failed to get user invite count for userId: ${userId}`, error)
      return 0
    }
  }

  async getUserLoginDaysCount(userId: string, startAt: Date, endAt: Date): Promise<number> {
    try {
      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.GET_USER_LOGIN_DAYS_COUNT, {
          userId,
          startAt,
          endAt,
        }),
      )
    } catch (error) {
      this.logger.error(`Failed to get user login days count for userId: ${userId}`, error)
      return 0
    }
  }

  async getUserConsecutiveLoginDaysCount(userId: string, startAt: Date, endAt: Date): Promise<number> {
    try {
      return await firstValueFrom(
        this.userClient.send(USER_PATTERNS.GET_USER_CONSECUTIVE_LOGIN_DAYS_COUNT, {
          userId,
          startAt,
          endAt,
        }),
      )
    } catch (error) {
      this.logger.error(`Failed to get user consecutive login days count for userId: ${userId}`, error)
      return 0
    }
  }

  // async isUserExists(userId: string): Promise<boolean> {
  //   try {
  //     return await firstValueFrom(this.userClient.send({ cmd: 'is_user_exists' }, userId))
  //   } catch (error) {
  //     this.logger.error(`Failed to check if user exists for userId: ${userId}`, error)
  //     return false
  //   }
  // }
}
