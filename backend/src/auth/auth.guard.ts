import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('トークンがありません')
    }

    const token = authHeader.split(' ')[1]

    try {
      const payload = this.jwt.verify(token, { secret: 'secret-key' })
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException('トークンが無効です')
    }
  }
}