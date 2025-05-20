import { Test, TestingModule } from '@nestjs/testing'
import { EventRewardResolver } from './event-reward.resolver'
import { EventRewardService } from './event-reward.service'

describe('EventRewardResolver', () => {
  let resolver: EventRewardResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventRewardResolver, EventRewardService],
    }).compile()

    resolver = module.get<EventRewardResolver>(EventRewardResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
