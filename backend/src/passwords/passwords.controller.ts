import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common'
import { PasswordsService } from './passwords.service'
import { AuthGuard } from '../auth/auth.guard'

@Controller('passwords')
@UseGuards(AuthGuard)
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.passwordsService.findAll(req.user.sub)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.passwordsService.findOne(id, req.user.sub)
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.passwordsService.create(req.user.sub, body)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.passwordsService.update(id, req.user.sub, body)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.passwordsService.remove(id, req.user.sub)
  }
}