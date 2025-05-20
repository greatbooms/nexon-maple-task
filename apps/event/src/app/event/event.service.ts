import { Injectable } from '@nestjs/common'
import { EventPrismaService } from '../../prisma'
import { Prisma } from '../../prisma/generated/client'
import type { JwtPayload } from '@maple/models'
import { EventType, UserRole } from '@maple/models'
import { GraphQLError } from 'graphql/error'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { EventRewardService } from '../event-reward/event-reward.service'
import {
  AttendanceEventCondition,
  CreateEventInput,
  EventInput,
  EventsArgs,
  InviteEventCondition,
  UpdateEventInput,
} from '../../model'
import EventWhereUniqueInput = Prisma.EventWhereUniqueInput
import EventWhereInput = Prisma.EventWhereInput

@Injectable()
export class EventService {
  constructor(private readonly prisma: EventPrismaService, private readonly eventRewardService: EventRewardService) {}

  async createEvent(input: CreateEventInput) {
    const cleanedInput = await this.cleanCreateEventInput(input)
    return await this.txCreateEvent(cleanedInput)
  }

  private async cleanCommonEventInput(input: EventInput) {
    const cleanedInput = new EventInput()

    if (input.startAt && input.endAt && input.startAt >= input.endAt) {
      throw new GraphQLError('Event start date must be before end date', {
        extensions: { code: 'EVENT_START_DATE_MUST_BE_BEFORE_END_DATE' },
      })
    }

    if (input.type) await this.validateConditionByType(input.type, input.condition)

    if (input.eventRewards) {
      for (const eventReward of input.eventRewards) {
        await this.eventRewardService.cleanCommonEventRewardInput(eventReward)
      }
    }

    return { ...input, ...cleanedInput }
  }

  private async cleanCreateEventInput(input: CreateEventInput) {
    const cleanedInput = await this.cleanCommonEventInput(input)

    return { ...input, ...cleanedInput } as CreateEventInput
  }

  private async validateConditionByType(type: EventType, condition: any) {
    if (condition === undefined || condition === null) {
      return
    }

    let conditionDto
    let errors

    switch (type) {
      case EventType.ATTENDANCE:
        conditionDto = plainToInstance(AttendanceEventCondition, condition)
        errors = await validate(conditionDto)

        if (errors.length > 0) {
          throw new GraphQLError(`출석 이벤트 조건 오류: ${this.formatErrors(errors)}`, {
            extensions: { code: 'ATTENDANCE_EVENT_CONDITION_ERROR' },
          })
        }

        if (conditionDto.requiredDays > 30) {
          throw new GraphQLError('출석 요구 일수는 최대 30일까지만 설정 가능합니다.', {
            extensions: { code: 'ATTENDANCE_REQUIRED_DAYS_LIMIT' },
          })
        }
        break

      case EventType.INVITE:
        conditionDto = plainToInstance(InviteEventCondition, condition)
        errors = await validate(conditionDto)

        if (errors.length > 0) {
          throw new GraphQLError(`초대 이벤트 조건 오류: ${this.formatErrors(errors)}`, {
            extensions: { code: 'INVITE_EVENT_CONDITION_ERROR' },
          })
        }

        if (conditionDto.requiredInvites > 50) {
          throw new GraphQLError('초대 요구 수는 최대 50명까지만 설정 가능합니다.', {
            extensions: { code: 'INVITE_REQUIRED_INVITES_LIMIT' },
          })
        }
        break

      default:
        throw new GraphQLError('지원하지 않는 이벤트 타입입니다.', {
          extensions: { code: 'UNSUPPORTED_EVENT_TYPE' },
        })
    }

    return true
  }

  private formatErrors(errors: any[]): string {
    return errors
      .map((err) => {
        const constraints = err.constraints ? Object.values(err.constraints).join(', ') : '알 수 없는 오류'

        return `${err.property}: ${constraints}`
      })
      .join('; ')
  }

  private async txCreateEvent(cleanedInput: CreateEventInput) {
    const { eventRewards, ...createEventInput } = cleanedInput

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          ...createEventInput,
        },
      })

      const bulkEventRewards = eventRewards.map((eventReward) => ({
        ...eventReward,
        eventId: event.id,
      }))

      await tx.eventReward.createMany({
        data: bulkEventRewards,
      })

      return event
    })
  }

  async updateEvent(input: UpdateEventInput) {
    const cleanedInput = await this.cleanUpdateEventInput(input)
    return await this.txUpdateEvent(cleanedInput)
  }

  private async cleanUpdateEventInput(input: UpdateEventInput) {
    const cleanedInput = await this.cleanCommonEventInput(input)
    return { ...input, ...cleanedInput } as UpdateEventInput
  }

  private async txUpdateEvent(cleanedInput: UpdateEventInput) {
    const { eventRewards, id: _eventId, ...updateEventInput } = cleanedInput

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.update({
        where: { id: _eventId },
        data: {
          ...updateEventInput,
        },
      })

      if (eventRewards) {
        for (const eventReward of eventRewards) {
          const { id: eventRewardId, ...restEventReward } = eventReward
          if (eventRewardId) {
            await tx.eventReward.update({
              where: { id: eventRewardId },
              data: { ...restEventReward },
            })
          } else {
            await tx.eventReward.create({
              data: {
                ...restEventReward,
                rewardType: eventReward.rewardType!,
                eventId: _eventId,
              },
            })
          }
        }
      }

      return event
    })
  }

  async events(jwtPayload: JwtPayload, eventsArgs: EventsArgs) {
    const { page = 1, take = 10, sortBy = [], title, type, startAt, endAt, isActive } = eventsArgs
    const skip = (page - 1) * take

    const whereConditions: EventWhereInput = {
      isDeleted: false,
    }

    if (title) whereConditions.title = { contains: title, mode: 'insensitive' }
    if (type) whereConditions.type = type
    if (startAt) whereConditions.endAt = { gte: startAt }
    if (endAt) whereConditions.startAt = { lte: endAt }
    if (isActive !== undefined) whereConditions.isActive = isActive

    if (jwtPayload.role !== UserRole.ADMIN && jwtPayload.role !== UserRole.OPERATOR) {
      whereConditions.isActive = true
    }

    const orderBy: any[] =
      sortBy.length > 0
        ? sortBy.map(({ field, direction }) => ({
            [field]: direction ? 'asc' : 'desc',
          }))
        : [{ createdAt: 'desc' }]

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy,
      }),
      this.prisma.event.count({
        where: whereConditions,
      }),
    ])

    const totalPages = Math.ceil(total / take)

    return {
      edges: events,
      pageInfo: {
        total,
        page,
        take,
        hasNextPage: page < totalPages,
        totalPages,
      },
    }
  }

  async event(payload: JwtPayload, id: string) {
    const whereConditions: EventWhereUniqueInput = {
      id,
    }
    if (payload.role !== UserRole.ADMIN && payload.role !== UserRole.OPERATOR) {
      whereConditions.isDeleted = false
      whereConditions.isActive = true
    }

    const event = await this.prisma.event.findUnique({
      where: whereConditions,
    })
    if (!event) {
      throw new GraphQLError('Event not found', {
        extensions: { code: 'EVENT_NOT_FOUND' },
      })
    }
    return event
  }

  async findByCondition(param: EventWhereInput) {
    return this.prisma.event.findMany({
      where: {
        ...param,
        isDeleted: false,
      },
    })
  }
}
