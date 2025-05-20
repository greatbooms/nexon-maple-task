import { Args, Mutation, Query, Resolver, ResolveReference } from '@nestjs/graphql'
import { UserService } from './user.service'
import type { JwtPayload } from '@maple/models'
import { Public, UserDecoded } from '@maple/shared'
import { UserLoader } from './user.loader'
import { SignInInput, SignUpInput, Token, UpdateUserInput, User, UserArgs } from '../../model'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly userLoader: UserLoader) {}

  @Public()
  @Mutation(() => Token, { description: '회원가입' })
  async signUp(@Args('input') signUpInput: SignUpInput) {
    return this.userService.signUp(signUpInput)
  }

  @Public()
  @Mutation(() => Token, { description: '로그인' })
  async signIn(@Args('input') signInInput: SignInInput) {
    return this.userService.signIn(signInInput)
  }

  @Mutation(() => User, { description: '회원정보 수정' })
  async updateUser(@UserDecoded() jwtPayload: JwtPayload, @Args('input') updateUserInput: UpdateUserInput) {
    return this.userService.updateUser(jwtPayload, updateUserInput)
  }

  @Query(() => User, { description: '회원정보 조회' })
  async user(@UserDecoded() jwtPayload: JwtPayload, @Args() userArgs: UserArgs) {
    return this.userService.user(jwtPayload, userArgs)
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.userLoader.userById.load(reference.id)
  }
}
