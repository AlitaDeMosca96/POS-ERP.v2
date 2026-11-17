import { Controller, Post, Body, UnauthorizedException, Get, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MasterLoginDto } from './dto/master-login.dto';
import { Public } from './public.decorator';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // <-- 5 intentos por minuto
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('master-login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // <-- 5 intentos por minuto
  async masterLogin(@Body() dto: MasterLoginDto) {
    return this.authService.masterLogin(dto.email, dto.password, dto.code2FA);
  }

  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Post('2fa/generate')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async generate2FA(@Req() req: RequestWithUser, @Body('code') code?: string) {
    return this.authService.generateTwoFactorAuthenticationSecret(req.user.id, code);
  }

  @Post('2fa/turn-on')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async turnOn2FA(@Req() req: RequestWithUser, @Body('code') code: string) {
    return this.authService.turnOnTwoFactorAuthentication(req.user.id, code);
  }
}