import { Controller, Get, Post, Body, UseGuards, Req, ForbiddenException, Patch, Param } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('super-admin')
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('metrics')
  getDashboardMetrics(@Req() req: RequestWithUser) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.getDashboardMetrics();
  }

  @Get('empresas')
  getEmpresas(@Req() req: RequestWithUser) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.getEmpresas();
  }

  @Post('empresas')
  crearEmpresa(@Body() data: any, @Req() req: RequestWithUser) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.crearEmpresa(data, req.user.email);
  }

  @Patch('empresas/:id/toggle')
  toggleEstado(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.toggleEstado(id, req.user.email);
  }

  @Post('empresas/:id/impersonar')
  impersonar(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.impersonarAdmin(id, req.user.email);
  }
}