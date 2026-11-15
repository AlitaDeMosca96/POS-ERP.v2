import { Controller, Post, Body, UnauthorizedException, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('master-login')
  async masterLogin(@Body() body: any) {
    return this.authService.masterLogin(body.email, body.password, body.code2FA);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FA(@Req() req: any) {
    return this.authService.generateTwoFactorAuthenticationSecret(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  async turnOn2FA(@Req() req: any, @Body('code') code: string) {
    return this.authService.turnOnTwoFactorAuthentication(req.user.id, code);
  }
}