import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  getResumen(@Req() req: RequestWithUser, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId || querySucursalId || null;
    return this.reportesService.getResumen(req.user.empresaId, targetSucursal);
  }
}