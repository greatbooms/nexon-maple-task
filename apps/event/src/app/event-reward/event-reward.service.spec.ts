import { Test, TestingModule } from '@nestjs/testing'
import { EventRewardService } from './event-reward.service'

describe('EventRewardService', () => {
  let service: EventRewardService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventRewardService],
    }).compile()

    service = module.get<EventRewardService>(EventRewardService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
