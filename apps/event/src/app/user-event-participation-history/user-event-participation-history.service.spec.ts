import { Test, TestingModule } from '@nestjs/testing'
import { UserEventParticipationHistoryService } from './user-event-participation-history.service'

describe('UserEventParticipationHistoryService', () => {
  let service: UserEventParticipationHistoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserEventParticipationHistoryService],
    }).compile()

    service = module.get<UserEventParticipationHistoryService>(UserEventParticipationHistoryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
