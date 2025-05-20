import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorator'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard as NestAuthGuard } from '@nestjs/passport'

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  override getRequest(context: ExecutionContext) {
    // GraphQL 컨텍스트에서 request 객체 추출
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  override handleRequest<TUser = any>(
    err: any,
    user: TUser | false,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    // 에러가 있거나 사용자가 없는 경우
    if (err || !user) {
      throw err || new UnauthorizedException('인증에 실패했습니다.')
    }
    return user as TUser
  }
}
