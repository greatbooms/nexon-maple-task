import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { EventService } from './event.service'
import type { JwtPayload } from '@maple/models'
import { UserRole } from '@maple/models'
import { CreateEventInput, Event, EventReward, Events, EventsArgs, UpdateEventInput } from '../../model'
import { Roles, UserDecoded } from '@maple/shared'
import { EventRewardLoader } from '../event-reward/event-reward.loader'

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly eventService: EventService, private readonly eventRewardLoader: EventRewardLoader) {}

  @Roles([UserRole.ADMIN, UserRole.OPERATOR])
  @Mutation(() => Event)
  async createEvent(@Args('input') input: CreateEventInput) {
    return this.eventService.createEvent(input)
  }

  @Roles([UserRole.ADMIN, UserRole.OPERATOR])
  @Mutation(() => Event)
  async updateEvent(@Args('input') input: UpdateEventInput) {
    return this.eventService.updateEvent(input)
  }

  @Query(() => Events)
  async events(@UserDecoded() payload: JwtPayload, @Args() eventsArgs: EventsArgs) {
    return this.eventService.events(payload, eventsArgs)
  }

  @Query(() => Event)
  async event(@UserDecoded() payload: JwtPayload, @Args('id') id: string) {
    return this.eventService.event(payload, id)
  }

  @ResolveField('eventRewards', () => [EventReward])
  async resolveEventRewards(@Parent() event: Event) {
    return this.eventRewardLoader.eventRewardsByEventId.load(event.id)
  }
}