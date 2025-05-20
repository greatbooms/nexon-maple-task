import { Test, TestingModule } from '@nestjs/testing'
import { UserEventParticipationHistoryResolver } from './user-event-participation-history.resolver'
import { UserEventParticipationHistoryService } from './user-event-participation-history.service'

describe('UserEventParticipationHistoryResolver', () => {
  let resolver: UserEventParticipationHistoryResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserEventParticipationHistoryResolver, UserEventParticipationHistoryService],
    }).compile()

    resolver = module.get<UserEventParticipationHistoryResolver>(UserEventParticipationHistoryResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
