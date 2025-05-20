import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { EventRewardService } from './event-reward.service'
import {
  CreateEventRewardInput,
  EventReward,
  EventRewards,
  EventRewardsArgs,
  UpdateEventRewardInput,
} from '../../model'
import { UserRole } from '@maple/models'
import { Roles } from '@maple/shared'

@Resolver(() => EventReward)
export class EventRewardResolver {
  constructor(private readonly eventRewardService: EventRewardService) {}

  @Roles([UserRole.ADMIN, UserRole.OPERATOR])
  @Mutation(() => EventReward)
  async createEventReward(@Args('input') input: CreateEventRewardInput) {
    return this.eventRewardService.createEventReward(input)
  }

  @Roles([UserRole.ADMIN, UserRole.OPERATOR])
  @Mutation(() => EventReward)
  async updateEventReward(@Args('input') input: UpdateEventRewardInput) {
    return this.eventRewardService.updateEventReward(input)
  }

  @Roles([UserRole.ADMIN, UserRole.OPERATOR])
  @Query(() => EventRewards)
  async eventRewards(@Args() args: EventRewardsArgs) {
    return this.eventRewardService.eventRewards(args)
  }

  @Roles([UserRole.ADMIN, UserRole.OPERATOR])
  @Query(() => EventReward)
  async eventReward(@Args('id') id: string) {
    return this.eventRewardService.eventReward(id)
  }
}
