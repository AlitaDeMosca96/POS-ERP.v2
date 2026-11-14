import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('master-login')
  masterLogin(@Body() loginDto: LoginDto) {
    return this.authService.masterLogin(loginDto);
  }

  // --- RUTAS PROTEGIDAS PARA CONFIGURAR 2FA ---
  @Get('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generate2FA(@Request() req: any) {
    return this.authService.generate2FASecret(req.user.id, req.user.email);
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOn2FA(@Request() req: any, @Body('code') code: string) {
    return this.authService.turnOn2FA(req.user.id, code);
  }
}