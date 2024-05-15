import { Controller, Request, Post, UseGuards, Body, NotFoundException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dto/auth.dto';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService
    ) {}

  @Post('auth/login')
  async login(@Body() user: AuthDto) {
    //validateUser находит возвращает пользователя и список его ролей
    const token = await this.authService.validateUser(user.login, user.password);
    if(token == null) {
      throw new NotFoundException(`Incorrect login or password`);
    }
    //login создает JWT-токен
    return this.authService.login(token);
  }
}
