import { registerEnumType } from '@nestjs/graphql'

export enum UserRole {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: '유저 역할',
  valuesMap: {
    USER: { description: '일반 유저' },
    OPERATOR: { description: '운영자' },
    AUDITOR: { description: '감사자' },
    ADMIN: { description: '관리자' },
  },
})
