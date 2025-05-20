import { Injectable, Logger } from '@nestjs/common'
import { Event, EventReward, EventPrismaService, Prisma } from '../../prisma'
import { UserService } from '../user/user.service'
import {
  AttendanceEventCondition,
  CreateUserEventParticipationHistoryInput,
  InviteEventCondition,
  UserEventParticipationHistoriesArgs,
  UserEventParticipationHistoryInput,
} from '../../model'
import { ParticipationResult, UserRole, EventType } from '@maple/models'
import { JwtPayload } from '@maple/models'
import UserEventParticipationHistoryWhereInput = Prisma.UserEventParticipationHistoryWhereInput
import { GraphQLError } from 'graphql/error'

@Injectable()
export class UserEventParticipationHistoryService {
  constructor(private readonly prisma: EventPrismaService, private readonly userService: UserService) {}

  private readonly logger = new Logger(UserService.name)

  async requestReward(payload: JwtPayload, input: CreateUserEventParticipationHistoryInput) {
    const cleanedInput = await this.cleanRequestReward(payload, input)
    return this.txRequestReward(cleanedInput)
  }

  private async cleanRequestReward(payload: JwtPayload, input: CreateUserEventParticipationHistoryInput) {
    const cleanedInput = new UserEventParticipationHistoryInput()

    cleanedInput.userId = payload.id
    cleanedInput.eventId = input.eventId

    const now = new Date()

    const event = await this.prisma.event.findUnique({
      where: {
        id: cleanedInput.eventId,
        isDeleted: false,
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: { eventRewards: true },
    })

    if (!event) {
      cleanedInput.result = ParticipationResult.FAILURE
      cleanedInput.resultDetail = 'Event not found or not active'
      return cleanedInput
    }

    if (event.totalReward <= 0) {
      cleanedInput.result = ParticipationResult.FAILURE
      cleanedInput.resultDetail = 'Event has no reward'
      return cleanedInput
    }

    const isParticipated = await this.prisma.userEventParticipationHistory.findFirst({
      where: {
        userId: cleanedInput.userId,
        eventId: cleanedInput.eventId,
        isDeleted: false,
        result: ParticipationResult.SUCCESS,
      },
    })

    if (!event.isDuplicated && isParticipated) {
      cleanedInput.result = ParticipationResult.ALREADY_PARTICIPATED
      cleanedInput.resultDetail = 'User already participated in this event'
      return cleanedInput
    }

    if (event.condition) {
      try {
        const checkResult = await this.checkCondition(event, cleanedInput.userId)
        console.log('checkResult', checkResult)
        if (!checkResult.conditionMet) {
          cleanedInput.result = ParticipationResult.CONDITION_NOT_MET
          cleanedInput.resultDetail = 'Condition not met'
          return cleanedInput
        }
      } catch (error: any) {
        cleanedInput.result = ParticipationResult.FAILURE
        cleanedInput.resultDetail = error.message
        return cleanedInput
      }
    }

    const selectedReward = await this.selectRewardByWeight(event.eventRewards)

    if (!selectedReward) {
      cleanedInput.result = ParticipationResult.FAILURE
      cleanedInput.resultDetail = 'No available rewards'
      return cleanedInput
    }

    cleanedInput.rewardId = selectedReward.id
    cleanedInput.result = ParticipationResult.SUCCESS

    return { ...input, ...cleanedInput }
  }

  private async checkCondition(event: Event, userId: string) {
    try {
      const condition = typeof event.condition === 'string' ? JSON.parse(event.condition) : event.condition
      let conditionMet = false
      let conditionDetails = {}

      if (event.type === EventType.INVITE) {
        const inviteCondition: InviteEventCondition = condition

        const inviteCount = await this.userService.getUserInviteCount(userId, event.startAt, event.endAt)
        conditionMet = inviteCount >= inviteCondition.requiredInvites
        conditionDetails = {
          current: inviteCount,
          required: condition.requiredInvites,
        }
      } else if (event.type === EventType.ATTENDANCE) {
        const attendanceCondition: AttendanceEventCondition = condition
        let totalDays = 0
        if (attendanceCondition.isConsecutive) {
          const consecutiveDays = await this.userService.getUserConsecutiveLoginDaysCount(
            userId,
            event.startAt,
            event.endAt,
          )
          conditionMet = consecutiveDays >= attendanceCondition.requiredDays
          totalDays = consecutiveDays
        } else {
          const loginDays = await this.userService.getUserLoginDaysCount(userId, event.startAt, event.endAt)
          conditionMet = loginDays >= attendanceCondition.requiredDays
          totalDays = loginDays
        }

        conditionDetails = {
          current: totalDays,
          required: attendanceCondition.requiredDays,
        }
      } else {
        throw new Error('Unknown event type')
      }

      return { conditionMet, conditionDetails }
    } catch (error) {
      this.logger.error('Error parsing event condition:', error)
      throw new Error('Failed to parse event condition')
    }
  }

  private async selectRewardByWeight(rewards: EventReward[]) {
    const selectableRewards = rewards.filter((reward) => !reward.isDeleted && reward.weight > 0)

    if (selectableRewards.length === 0) {
      return null
    }

    let totalWeight = 0
    for (const reward of selectableRewards) {
      totalWeight += reward.weight
    }

    if (totalWeight === 0) {
      // 모든 보상의 weight가 0인 경우
      // 균등 분포로 보상 선택
      const randomIndex = Math.floor(Math.random() * selectableRewards.length)
      return selectableRewards[randomIndex]
    }

    const randomNumber = Math.random() * totalWeight
    let cumulativeWeight = 0
    for (const reward of selectableRewards) {
      cumulativeWeight += reward.weight
      if (randomNumber < cumulativeWeight) {
        return reward // 선택된 보상 반환
      }
    }

    return selectableRewards.length > 0 ? selectableRewards[selectableRewards.length - 1] : null
  }

  private txRequestReward(cleanedInput: UserEventParticipationHistoryInput) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.userEventParticipationHistory.create({
        data: {
          userId: cleanedInput.userId!,
          eventId: cleanedInput.eventId!,
          rewardId: cleanedInput.rewardId,
          result: cleanedInput.result!,
          resultDetail: cleanedInput.resultDetail,
        },
      })

      await tx.event.update({
        where: { id: cleanedInput.eventId! },
        data: {
          totalReward: {
            decrement: 1,
          },
        },
      })
      return result
    })
  }

  async userEventParticipationHistories(
    jwtPayload: JwtPayload,
    userEventParticipationHistoriesArgs: UserEventParticipationHistoriesArgs,
  ) {
    const { page = 1, take = 10, sortBy = [], userId, eventId, rewardId, result } = userEventParticipationHistoriesArgs
    const skip = (page - 1) * take

    const whereConditions: UserEventParticipationHistoryWhereInput = {
      isDeleted: false,
    }

    if (eventId) whereConditions.eventId = eventId
    if (rewardId) whereConditions.rewardId = rewardId
    if (result !== undefined) whereConditions.result = result

    // 권한 체크: 관리자나 운영자가 아니면 자신의 기록만 조회 가능
    if (jwtPayload.role !== UserRole.ADMIN && jwtPayload.role !== UserRole.AUDITOR) {
      whereConditions.userId = jwtPayload.id
    } else if (userId) {
      whereConditions.userId = userId
    } else {
      whereConditions.userId = jwtPayload.id
    }

    const orderBy: any[] =
      sortBy.length > 0
        ? sortBy.map(({ field, direction }) => ({
            [field]: direction ? 'asc' : 'desc',
          }))
        : [{ createdAt: 'desc' }]

    const [participations, total] = await Promise.all([
      this.prisma.userEventParticipationHistory.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy,
      }),
      this.prisma.userEventParticipationHistory.count({
        where: whereConditions,
      }),
    ])

    const totalPages = Math.ceil(total / take)

    return {
      edges: participations,
      pageInfo: {
        total,
        page,
        take,
        hasNextPage: page < totalPages,
        totalPages,
      },
    }
  }

  async userEventParticipationHistory(payload: JwtPayload, eventId: string) {
    const adminFlag = payload.role === UserRole.ADMIN || payload.role === UserRole.AUDITOR
    const participation = await this.prisma.userEventParticipationHistory.findFirst({
      where: {
        userId: adminFlag ? undefined : payload.id,
        eventId,
        isDeleted: false,
      },
    })
    if (!participation) {
      throw new GraphQLError('User event participation history not found', {
        extensions: { code: 'USER_EVENT_PARTICIPATION_HISTORY_NOT_FOUND' },
      })
    }
    return participation
  }
}
