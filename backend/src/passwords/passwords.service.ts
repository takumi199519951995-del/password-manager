import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PasswordsService {
  constructor(private prisma: PrismaService) {}

  // 一覧取得
  async findAll(userId: string) {
    return this.prisma.password.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  // 詳細取得
  async findOne(id: string, userId: string) {
    const password = await this.prisma.password.findFirst({
      where: { id, userId },
    })
    if (!password) {
      throw new NotFoundException('パスワードが見つかりません')
    }
    return password
  }

  // 作成
  async create(userId: string, data: {
    serviceName: string
    username: string
    password: string
    url?: string
    category?: string
    memo?: string
  }) {
    return this.prisma.password.create({
      data: { userId, ...data },
    })
  }

  // 更新
  async update(id: string, userId: string, data: {
    serviceName?: string
    username?: string
    password?: string
    url?: string
    category?: string
    memo?: string
  }) {
    await this.findOne(id, userId)
    return this.prisma.password.update({
      where: { id },
      data,
    })
  }

  // 削除
  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    return this.prisma.password.delete({
      where: { id },
    })
  }
}