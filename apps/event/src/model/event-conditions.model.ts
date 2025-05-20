import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator'

// 출석 이벤트 조건
export class AttendanceEventCondition {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  requiredDays!: number

  @IsOptional()
  @IsBoolean()
  isConsecutive!: boolean
}

// 친구 초대 이벤트 조건
export class InviteEventCondition {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  requiredInvites!: number

  @IsOptional()
  @IsInt()
  @Min(0)
  requiredInvitesPerDayLimit?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  requiredInvitesPerDay?: number
}
