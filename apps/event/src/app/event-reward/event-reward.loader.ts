import DataLoader from 'dataloader'
import { Injectable, Scope } from '@nestjs/common'
import { EventRewardService } from './event-reward.service'
import { EventReward } from '../../prisma/generated/client'

@Injectable({ scope: Scope.REQUEST })
export class EventRewardLoader {
  constructor(private readonly eventRewardService: EventRewardService) {}

  public readonly eventRewardById = new DataLoader<string, EventReward>(async (ids: readonly string[]) => {
    const idSet = new Set(ids)
    const eventRewards = await this.eventRewardService.findByCondition({
      id: { in: Array.from(idSet) },
    })
    const eventRewardMap = new Map()
    eventRewards.forEach((eventReward) => {
      eventRewardMap.set(eventReward.id, eventReward)
    })

    return ids.map((id) => eventRewardMap.get(id) || null)
  })

  public readonly eventRewardsByEventId = new DataLoader<string, EventReward[]>(async (eventIds: readonly string[]) => {
    const idSet = new Set(eventIds)
    const eventRewards = await this.eventRewardService.findByCondition({
      eventId: { in: Array.from(idSet) },
    })
    const eventRewardMap = new Map<string, EventReward[]>()

    eventIds.forEach((eventId) => eventRewardMap.set(eventId, []))

    eventRewards.forEach((eventReward) => {
      if (eventReward.eventId && eventRewardMap.has(eventReward.eventId)) {
        eventRewardMap.get(eventReward.eventId)?.push(eventReward)
      }
    })

    return eventIds.map((eventId) => eventRewardMap.get(eventId) || [])
  })
}
