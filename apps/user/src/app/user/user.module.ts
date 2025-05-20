import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserResolver } from './user.resolver'
import { PasswordService } from './password.service'
import { JwtModule } from '@nestjs/jwt'
import { UserController } from './user.controller'
import { UserLoader } from './user.loader'

@Module({
  imports: [JwtModule.register({})],
  controllers: [UserController],
  providers: [UserResolver, UserService, PasswordService, UserLoader],
})
export class UserModule {}
