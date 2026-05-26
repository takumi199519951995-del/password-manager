import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // 新規登録
  async register(email: string, password: string) {
    // メールアドレスの重複チェック
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException('このメールアドレスはすでに使用されています')
    }

    // パスワードをハッシュ化
    const hashed = await bcrypt.hash(password, 10)

    // ユーザーを作成
    const user = await this.prisma.user.create({
      data: { email, password: hashed },
    })

    // JWTトークンを返す
    return { token: this.jwt.sign({ sub: user.id, email: user.email }) }
  }

  // ログイン
  async login(email: string, password: string) {
    // ユーザーを検索
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが間違っています')
    }

    // パスワードを確認
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが間違っています')
    }

    // JWTトークンを返す
    return { token: this.jwt.sign({ sub: user.id, email: user.email }) }
  }
}