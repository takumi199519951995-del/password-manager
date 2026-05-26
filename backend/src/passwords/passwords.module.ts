import { Module } from '@nestjs/common'
import { PasswordsService } from './passwords.service'
import { PasswordsController } from './passwords.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PasswordsController],
  providers: [PasswordsService],
})
export class PasswordsModule {}