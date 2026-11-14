import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  getResumen(@Request() req: any, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId || querySucursalId || null;
    return this.reportesService.getResumen(req.user.empresaId, targetSucursal);
  }
}