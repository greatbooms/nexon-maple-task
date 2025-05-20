import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { UserService } from './user.service'
import { USER_PATTERNS } from '@maple/shared'

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(USER_PATTERNS.GET_USER_INVITE_COUNT)
  async getUserInviteCount(data: { userId: string; startAt: string; endAt: string }): Promise<number> {
    const startAt = new Date(data.startAt)
    const endAt = new Date(data.endAt)
    return this.userService.getUserInviteCount(data.userId, startAt, endAt)
  }

  @MessagePattern(USER_PATTERNS.GET_USER_LOGIN_DAYS_COUNT)
  async getUserLoginDaysCount(data: { userId: string; startAt: string; endAt: string }): Promise<number> {
    const startAt = new Date(data.startAt)
    const endAt = new Date(data.endAt)
    return this.userService.getUserLoginDaysCount(data.userId, startAt, endAt)
  }

  @MessagePattern(USER_PATTERNS.GET_USER_CONSECUTIVE_LOGIN_DAYS_COUNT)
  async getUserConsecutiveLoginDaysCount(data: { userId: string; startAt: string; endAt: string }): Promise<number> {
    const startAt = new Date(data.startAt)
    const endAt = new Date(data.endAt)
    return this.userService.getUserConsecutiveLoginDaysCount(data.userId, startAt, endAt)
  }

  // @MessagePattern({ cmd: 'is_user_exists' })
  // async isUserExists(userId: string): Promise<boolean> {
  //   return this.userService.isUserExists(userId)
  // }
}
