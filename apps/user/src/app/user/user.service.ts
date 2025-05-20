import { Injectable, Logger } from '@nestjs/common'
import { PasswordService } from './password.service'
import { JwtService } from '@nestjs/jwt'
import { GraphQLError } from 'graphql/error'
import { ConfigService } from '@nestjs/config'
import { Prisma, User, UserPrismaService } from '../../prisma'
import { SignInInput, SignUpInput, UpdateUserInput, UserArgs } from '../../model'
import { type JwtPayload, UserRole } from '@maple/models'
import UserWhereInput = Prisma.UserWhereInput

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: UserPrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(UserService.name)

  async signUp(signUpInput: SignUpInput) {
    const cleanInput = await this.cleanSignUpInput(signUpInput)
    const savedUser = await this.txSignUp(cleanInput)
    return this.generateToken(savedUser)
  }

  private async cleanSignUpInput(signUpInput: SignUpInput) {
    this.logger.log(`Cleaning sign up input parameters ${JSON.stringify(signUpInput, null, 2)}`)
    const cleanInput = new SignUpInput()

    const existingUser = await this.prisma.user.findUnique({
      where: { email: signUpInput.email },
    })

    if (existingUser) {
      this.logger.error(`User with email ${signUpInput.email} already exists`)
      throw new GraphQLError('User already exists', { extensions: { code: 'USER_ALREADY_EXISTS' } })
    }

    cleanInput.email = signUpInput.email
    cleanInput.password = await this.passwordService.hashPassword(signUpInput.password)
    return { ...signUpInput, ...cleanInput }
  }

  private async txSignUp(cleanInput: SignUpInput) {
    this.logger.log(`Creating user with input parameters ${JSON.stringify(cleanInput, null, 2)}`)
    return this.prisma.user.create({
      data: {
        ...cleanInput,
      },
    })
  }

  // JWT service 로 분리 하는게 좋음
  private generateToken(user: User) {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    }
    const accessKey = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN')
    const issuer = this.configService.get<string>('JWT_ISSUER')

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: accessKey,
        expiresIn: accessExpiresIn,
        issuer,
      },
    )

    const refreshKey = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN')

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: refreshKey,
        expiresIn: refreshExpiresIn,
        issuer,
      },
    )

    return {
      accessToken,
      refreshToken,
    }
  }

  async signIn(signInInput: SignInInput) {
    const user = await this.cleanSignInInput(signInInput)
    await this.txSignIn(user)
    return this.generateToken(user)
  }

  private async cleanSignInInput(signInInput: SignInInput) {
    this.logger.log(`Cleaning sign in input parameters ${JSON.stringify(signInInput, null, 2)}`)

    const user = await this.prisma.user.findUnique({
      where: { email: signInInput.email },
    })

    if (!user) {
      this.logger.error(`User with email ${signInInput.email} does not exist`)
      throw new GraphQLError('User does not exist', { extensions: { code: 'USER_DOES_NOT_EXIST' } })
    }

    const isPasswordValid = await this.passwordService.validatePassword(signInInput.password, user.password)
    if (!isPasswordValid) {
      this.logger.error(`Invalid password for user with email ${signInInput.email}`)
      throw new GraphQLError('Invalid password', { extensions: { code: 'INVALID_PASSWORD' } })
    }

    return user
  }

  private async txSignIn(user: User) {
    this.logger.log(`Signing in user with email ${user.email}`)

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      })

      await tx.loginHistory.create({
        data: {
          userId: user.id,
          loginAt: new Date(),
        },
      })
    })
  }

  async updateUser(payload: JwtPayload, updateUserInput: UpdateUserInput) {
    const cleanInput = await this.cleanUpdateUserInput(payload, updateUserInput)
    return this.txUpdateUser(cleanInput)
  }

  private async cleanUpdateUserInput(payload: JwtPayload, updateUserInput: UpdateUserInput) {
    this.logger.log(`Cleaning update user input parameters ${JSON.stringify(updateUserInput, null, 2)}`)
    const cleanInput = new UpdateUserInput()

    if (payload.role !== UserRole.ADMIN) {
      if (updateUserInput.id || updateUserInput.role || updateUserInput.email)
        throw new GraphQLError('Invalid input', { extensions: { code: 'INVALID_INPUT' } })
      cleanInput.id = payload.id
    } else {
      if (!updateUserInput.id) cleanInput.id = payload.id
      else cleanInput.id = updateUserInput.id
    }

    const user = await this.prisma.user.findUnique({
      where: { id: cleanInput.id },
    })

    if (!user) {
      this.logger.error(`User with id ${updateUserInput.id} does not exist`)
      throw new GraphQLError('User does not exist', { extensions: { code: 'USER_DOES_NOT_EXIST' } })
    }

    return { ...updateUserInput, ...cleanInput }
  }

  private async txUpdateUser(cleanInput: UpdateUserInput) {
    this.logger.log(`Updating user with input parameters ${JSON.stringify(cleanInput, null, 2)}`)
    const { id, ...updateUserInput } = cleanInput
    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserInput,
      },
    })
  }

  async user(payload: JwtPayload, userArgs: UserArgs) {
    let userId
    if (payload.role !== UserRole.ADMIN) {
      if (userArgs.id) throw new GraphQLError('Invalid input', { extensions: { code: 'INVALID_INPUT' } })
      userId = payload.id
    } else {
      if (!userArgs.id) userId = payload.id
      else userId = userArgs.id
    }

    if (!userId) {
      this.logger.error(`User id is required`)
      throw new GraphQLError('User id is required', { extensions: { code: 'USER_ID_REQUIRED' } })
    }

    return this.prisma.user.findUnique({
      where: { id: userId },
    })
  }

  async getUserInviteCount(userId: string, startAt: Date, endAt: Date): Promise<number> {
    this.logger.log(
      `Getting user invite count for referrer userId: ${userId}, from: ${startAt.toISOString()}, to: ${endAt.toISOString()}`,
    )

    try {
      const users = await this.prisma.inviteHistory.findMany({
        where: {
          referrerUserId: userId, // 초대자 ID 조건
          inviteAt: {
            gte: startAt, // 시작일 이후 (포함)
            lte: endAt, // 종료일 이전 (포함)
          },
        },
        distinct: ['inviteeUserId'], // 초대받은 사용자 ID로 중복 제거
      })

      return users.length // 고유한 초대받은 사용자 ID의 수를 반환
    } catch (error: any) {
      this.logger.error(
        `Failed to get user invite count for referrer userId: ${userId}. Error: ${error.message}`,
        error.stack,
      )
      return 0
    }
  }

  async getUserLoginDaysCount(userId: string, startAt: Date, endAt: Date): Promise<number> {
    this.logger.log(
      `Getting user KST unique login days count for userId: ${userId}, startAt: ${startAt.toISOString()}, endAt: ${endAt.toISOString()}`,
    )

    const loginHistories = await this.prisma.loginHistory.findMany({
      where: {
        userId,
        loginAt: {
          gte: startAt,
          lte: endAt,
        },
      },
      select: {
        loginAt: true,
      },
    })

    if (loginHistories.length === 0) {
      return 0
    }

    const uniqueKSTLoginDates = new Set<string>()
    for (const record of loginHistories) {
      uniqueKSTLoginDates.add(this.getKSTDateString(record.loginAt))
    }

    return uniqueKSTLoginDates.size
  }

  async getUserConsecutiveLoginDaysCount(userId: string, startAt: Date, endAt: Date): Promise<number> {
    this.logger.log(
      `Getting user KST MAX consecutive login days count for userId: ${userId}, startAt: ${startAt.toISOString()}, endAt: ${endAt.toISOString()}`,
    )

    const loginHistories = await this.prisma.loginHistory.findMany({
      where: {
        userId,
        loginAt: {
          gte: startAt,
          lte: endAt,
        },
      },
      select: {
        loginAt: true,
      },
      orderBy: {
        loginAt: 'asc',
      },
    })

    if (loginHistories.length === 0) {
      return 0
    }

    const uniqueSortedKSTLoginDates = [...new Set(loginHistories.map((lh) => this.getKSTDateString(lh.loginAt)))].sort()

    if (uniqueSortedKSTLoginDates.length < 2) {
      return uniqueSortedKSTLoginDates.length
    }

    let maxConsecutiveCount = 1
    let currentConsecutiveCount = 1

    for (let i = 1; i < uniqueSortedKSTLoginDates.length; i++) {
      const previousKSTDateStr = uniqueSortedKSTLoginDates[i - 1]
      const currentKSTDateStr = uniqueSortedKSTLoginDates[i]

      const expectedNextKSTDateStr = this.getNextKSTDateString(previousKSTDateStr)

      if (currentKSTDateStr === expectedNextKSTDateStr) {
        currentConsecutiveCount++
      } else {
        maxConsecutiveCount = Math.max(maxConsecutiveCount, currentConsecutiveCount)
        currentConsecutiveCount = 1
      }
    }

    maxConsecutiveCount = Math.max(maxConsecutiveCount, currentConsecutiveCount)

    return maxConsecutiveCount
  }

  private getNextKSTDateString(kstDateString: string): string {
    const [year, month, day] = kstDateString.split('-').map(Number)
    // Date.UTC()를 사용하여 날짜를 생성하면 윤년 및 월별 일수 자동 처리
    const currentUTCDate = new Date(Date.UTC(year, month - 1, day)) // month는 0부터 시작
    currentUTCDate.setUTCDate(currentUTCDate.getUTCDate() + 1) // 하루 추가

    const nextYear = currentUTCDate.getUTCFullYear()
    const nextMonth = (currentUTCDate.getUTCMonth() + 1).toString().padStart(2, '0')
    const nextDay = currentUTCDate.getUTCDate().toString().padStart(2, '0')

    return `${nextYear}-${nextMonth}-${nextDay}`
  }

  private getKSTDateString(date: Date): string {
    const kstTimezoneOffset = 9 * 60 * 60 * 1000
    const kstDate = new Date(date.getTime() + kstTimezoneOffset)

    const year = kstDate.getUTCFullYear()
    const month = (kstDate.getUTCMonth() + 1).toString().padStart(2, '0') // getUTCMonth()는 0부터 시작
    const day = kstDate.getUTCDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  async findByCondition(param: UserWhereInput) {
    return this.prisma.user.findMany({
      where: {
        ...param,
      },
    })
  }
}
