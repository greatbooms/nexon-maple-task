import { Injectable } from '@nestjs/common'
import {
  CreateEventRewardInput,
  EventRewardInput,
  EventRewardsArgs,
  UpdateEventRewardInput,
} from '../../model'
import { EventRewardType } from '@maple/models'
import { EventPrismaService, Prisma } from '../../prisma'
import { GraphQLError } from 'graphql/error'
import EventRewardWhereInput = Prisma.EventRewardWhereInput

@Injectable()
export class EventRewardService {
  constructor(private readonly prisma: EventPrismaService) {}

  async cleanCommonEventRewardInput(input: EventRewardInput) {
    const cleanedInput = new EventRewardInput()

    if (input.referenceId) {
      if (!input.rewardType)
        throw new GraphQLError('Reward type is required when reference ID is provided', {
          extensions: { code: 'REWARD_TYPE_REQUIRED' },
        })
      const isValidReference = await this.validateReference(input.rewardType, input.referenceId)
      if (!isValidReference)
        throw new GraphQLError(`Invalid reference ID for type ${input.rewardType}`, {
          extensions: { code: 'INVALID_REFERENCE_ID' },
        })
    } else if (!input.id && !input.rewardType) {
      throw new GraphQLError('Newly created event rewards must have a reward type', {
        extensions: { code: 'REWARD_TYPE_REQUIRED' },
      })
    }

    return { ...input, ...cleanedInput }
  }

  private async validateReference(type: EventRewardType, id: string): Promise<boolean> {
    try {
      switch (type) {
        case EventRewardType.ITEM:
          return !!(await this.prisma.item.findUnique({ where: { id } }))
        case EventRewardType.POINT:
          return !!(await this.prisma.point.findUnique({ where: { id } }))
        case EventRewardType.COUPON:
          return !!(await this.prisma.coupon.findUnique({ where: { id } }))
        default:
          return false
      }
    } catch (error) {
      return false
    }
  }

  async createEventReward(input: CreateEventRewardInput) {
    const cleanedInput = await this.cleanCreateEventRewardInput(input)
    return await this.txCreateEventReward(cleanedInput)
  }

  private async cleanCreateEventRewardInput(input: CreateEventRewardInput) {
    const cleanedInput = await this.cleanCommonEventRewardInput(input)

    if (input.eventId) {
      const event = await this.prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) {
        throw new GraphQLError('Event not found', {
          extensions: { code: 'EVENT_NOT_FOUND' },
        })
      }
    } else {
      throw new GraphQLError('Event ID is required for creating event rewards', {
        extensions: { code: 'EVENT_ID_REQUIRED' },
      })
    }

    return { ...input, ...cleanedInput } as CreateEventRewardInput
  }

  private async txCreateEventReward(cleanedInput: CreateEventRewardInput) {
    const { eventId, ...createEventRewardInput } = cleanedInput
    return this.prisma.eventReward.create({
      data: {
        ...createEventRewardInput,
        event: {
          connect: { id: eventId },
        },
      },
    })
  }

  async updateEventReward(input: UpdateEventRewardInput) {
    const cleanedInput = await this.cleanUpdateEventRewardInput(input)
    return await this.txUpdateEventReward(cleanedInput)
  }

  private async cleanUpdateEventRewardInput(input: UpdateEventRewardInput) {
    const cleanedInput = await this.cleanCommonEventRewardInput(input)

    return { ...input, ...cleanedInput } as UpdateEventRewardInput
  }

  private async txUpdateEventReward(cleanedInput: UpdateEventRewardInput) {
    const { id, ...updateEventRewardInput } = cleanedInput
    return this.prisma.eventReward.update({
      where: { id },
      data: {
        ...updateEventRewardInput,
      },
    })
  }

  async eventRewards(args: EventRewardsArgs) {
    const {
      page = 1,
      take = 10,
      sortBy = [],
      eventId,
      rewardType,
      minQuantity,
      maxQuantity,
      minWeight,
      maxWeight,
      referenceId,
    } = args

    const skip = (page - 1) * take

    const where: any = {
      isDeleted: false,
    }

    if (eventId) where.eventId = eventId
    if (rewardType) where.rewardType = rewardType
    if (referenceId) where.referenceId = referenceId

    if (minQuantity !== undefined || maxQuantity !== undefined) {
      where.quantity = {}
      if (minQuantity !== undefined) where.quantity.gte = minQuantity
      if (maxQuantity !== undefined) where.quantity.lte = maxQuantity
    }

    if (minWeight !== undefined || maxWeight !== undefined) {
      where.weight = {}
      if (minWeight !== undefined) where.weight.gte = minWeight
      if (maxWeight !== undefined) where.weight.lte = maxWeight
    }

    const orderBy =
      sortBy.length > 0
        ? sortBy.map(({ field, direction }) => ({
            [field]: direction ? 'asc' : 'desc',
          }))
        : [{ createdAt: 'desc' }]

    const [eventRewards, total] = await Promise.all([
      this.prisma.eventReward.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          event: true,
        },
      }),
      this.prisma.eventReward.count({ where }),
    ])

    const totalPages = Math.ceil(total / take)

    return {
      edges: eventRewards,
      pageInfo: {
        total,
        page,
        take,
        hasNextPage: page < totalPages,
        totalPages,
      },
    }
  }

  async eventReward(id: string) {
    const eventReward = await this.prisma.eventReward.findUnique({
      where: { id, isDeleted: false },
    })

    if (!eventReward) {
      throw new GraphQLError('Event reward not found', {
        extensions: { code: 'EVENT_REWARD_NOT_FOUND' },
      })
    }

    return eventReward
  }

  async findByCondition(param: EventRewardWhereInput) {
    return this.prisma.eventReward.findMany({
      where: {
        ...param,
        isDeleted: false,
      },
    })
  }
}
