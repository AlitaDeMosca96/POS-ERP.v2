import { Controller, Get, Req, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('reportes')
@Roles(Rol.ADMIN)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  getResumen(
    @Req() req: RequestWithUser, 
    @Query('sucursalId') querySucursalId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string
  ) {
    const targetSucursal = req.user.sucursalId || querySucursalId || null;
    return this.reportesService.getResumen(req.user.empresaId, targetSucursal, fechaInicio, fechaFin);
  }
}