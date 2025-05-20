import { Event } from '../../model'
import DataLoader from 'dataloader'
import { EventService } from './event.service'
import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.REQUEST })
export class EventLoader {
  constructor(private readonly eventService: EventService) {}

  public readonly eventById = new DataLoader<string, Event>(async (ids: readonly string[]) => {
    const idSet = new Set(ids)
    const events = await this.eventService.findByCondition({
      id: { in: Array.from(idSet) },
    })
    const eventMap = new Map()
    events.forEach((event) => {
      eventMap.set(event.id, event)
    })

    return ids.map((id) => eventMap.get(id) || null)
  })
}
