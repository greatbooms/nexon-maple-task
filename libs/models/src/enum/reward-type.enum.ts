import { registerEnumType } from '@nestjs/graphql'

export enum EventRewardType {
  POINT = 'POINT',
  ITEM = 'ITEM',
  COUPON = 'COUPON',
}

registerEnumType(EventRewardType, {
  name: 'EventRewardType',
  description: '이벤트 보상 타입',
  valuesMap: {
    POINT: { description: '포인트' },
    ITEM: { description: '아이템' },
    COUPON: { description: '쿠폰' },
  },
})
