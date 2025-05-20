import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { UserEventParticipationHistoryService } from './user-event-participation-history.service'
import {
  CreateUserEventParticipationHistoryInput,
  Event,
  EventReward,
  UserEventParticipationHistories,
  UserEventParticipationHistoriesArgs,
  UserEventParticipationHistory,
} from '../../model'
import { type JwtPayload } from '@maple/models'
import { UserDecoded } from '@maple/shared'
import { EventLoader } from '../event/event.loader'
import { EventRewardLoader } from '../event-reward/event-reward.loader'
import { User } from '../../model/user.model'

@Resolver(() => UserEventParticipationHistory)
export class UserEventParticipationHistoryResolver {
  constructor(
    private readonly userEventParticipationHistoryService: UserEventParticipationHistoryService,
    private readonly eventLoader: EventLoader,
    private readonly eventRewardLoader: EventRewardLoader,
  ) {}

  @Mutation(() => UserEventParticipationHistory)
  async requestReward(
    @UserDecoded() payload: JwtPayload,
    @Args('input') input: CreateUserEventParticipationHistoryInput,
  ) {
    return this.userEventParticipationHistoryService.requestReward(payload, input)
  }

  @Query(() => UserEventParticipationHistories)
  async userEventParticipationHistories(
    @UserDecoded() payload: JwtPayload,
    @Args() userEventParticipationHistoriesArgs: UserEventParticipationHistoriesArgs,
  ) {
    return this.userEventParticipationHistoryService.userEventParticipationHistories(
      payload,
      userEventParticipationHistoriesArgs,
    )
  }

  @Query(() => UserEventParticipationHistory)
  async userEventParticipationHistory(@UserDecoded() payload: JwtPayload, @Args('eventId') eventId: string) {
    return this.userEventParticipationHistoryService.userEventParticipationHistory(payload, eventId)
  }

  @ResolveField(() => Event, { nullable: true })
  async resolveEvent(@Parent() userEventParticipationHistory: UserEventParticipationHistory) {
    return this.eventLoader.eventById.load(userEventParticipationHistory.eventId)
  }

  @ResolveField(() => EventReward, { nullable: true })
  async resolveEventReward(@Parent() userEventParticipationHistory: UserEventParticipationHistory) {
    if (!userEventParticipationHistory.rewardId) {
      return null
    }
    return this.eventRewardLoader.eventRewardById.load(userEventParticipationHistory.rewardId)
  }

  @ResolveField('user', () => User, { nullable: true })
  async resolveUser(@Parent() userEventParticipationHistory: UserEventParticipationHistory) {
    return { __typename: 'User', id: userEventParticipationHistory.userId }
  }
}
