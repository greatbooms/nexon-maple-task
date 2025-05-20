import { registerEnumType } from '@nestjs/graphql'

export enum ParticipationResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  CONDITION_NOT_MET = 'CONDITION_NOT_MET',
  ALREADY_PARTICIPATED = 'ALREADY_PARTICIPATED',
}

registerEnumType(ParticipationResult, {
  name: 'ParticipationResult',
  description: '참여 결과',
  valuesMap: {
    SUCCESS: { description: '성공' },
    FAILURE: { description: '실패' },
    CONDITION_NOT_MET: { description: '조건 미달' },
    ALREADY_PARTICIPATED: { description: '이미 참여함' },
  },
})
