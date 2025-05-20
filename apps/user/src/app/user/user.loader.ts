import DataLoader from 'dataloader'
import { Injectable, Scope } from '@nestjs/common'
import { UserService } from './user.service'
import { User } from '../../model'

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(private readonly userService: UserService) {}

  public readonly userById = new DataLoader<string, User>(async (ids: readonly string[]) => {
    const idSet = new Set(ids)
    const users = await this.userService.findByCondition({
      id: { in: Array.from(idSet) },
    })
    const userMap = new Map()
    users.forEach((user) => {
      userMap.set(user.id, user)
    })

    return ids.map((id) => userMap.get(id) || null)
  })
}
