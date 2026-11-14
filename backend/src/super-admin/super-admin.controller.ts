import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException, Patch, Param } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('super-admin')
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('metrics')
  getDashboardMetrics(@Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.getDashboardMetrics();
  }

  @Get('empresas')
  getEmpresas(@Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.getEmpresas();
  }

  @Post('empresas')
  crearEmpresa(@Body() data: any, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.crearEmpresa(data, req.user.email); // <-- Pasamos el email
  }

  @Patch('empresas/:id/toggle')
  toggleEstado(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.toggleEstado(id, req.user.email); // <-- Pasamos el email
  }

  @Post('empresas/:id/impersonar')
  impersonar(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.superAdminService.impersonarAdmin(id, req.user.email); // <-- Pasamos el email
  }
}