import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  getResumen(@Request() req: any) {
    return this.reportesService.getResumen(req.user.empresaId);
  }
}