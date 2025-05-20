import { registerEnumType } from '@nestjs/graphql'

export enum EventType {
  ATTENDANCE = 'ATTENDANCE',
  INVITE = 'INVITE',
}

registerEnumType(EventType, {
  name: 'EventType',
  description: '이벤트 타입',
  valuesMap: {
    ATTENDANCE: { description: '출석체크 이벤트' },
    INVITE: { description: '친구초대 이벤트' },
  },
})
