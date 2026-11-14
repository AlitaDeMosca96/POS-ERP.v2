import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('super-admin')
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('empresas')
  getEmpresas(@Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') {
      throw new ForbiddenException('No tenés permisos de Super Admin');
    }
    return this.superAdminService.getEmpresas();
  }

  @Post('empresas')
  crearEmpresa(@Body() data: any, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') {
      throw new ForbiddenException('No tenés permisos de Super Admin');
    }
    return this.superAdminService.crearEmpresa(data);
  }
}