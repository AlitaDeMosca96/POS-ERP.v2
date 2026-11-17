import { Controller, Get, Post, Body, Req, Patch, Param } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { ImpersonarDto } from './dto/impersonar.dto';
import { CrearEmpresaAdminDto } from './dto/crear-empresa-admin.dto';

@Controller('super-admin')
@Roles(Rol.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('metrics')
  getDashboardMetrics() {
    return this.superAdminService.getDashboardMetrics();
  }

  @Get('empresas')
  getEmpresas() {
    return this.superAdminService.getEmpresas();
  }

  @Post('empresas')
  crearEmpresa(@Body() data: CrearEmpresaAdminDto, @Req() req: RequestWithUser) {
    return this.superAdminService.crearEmpresa(data, req.user.email);
  }

  @Patch('empresas/:id/toggle')
  toggleEstado(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.superAdminService.toggleEstado(id, req.user.email);
  }

  @Post('empresas/:id/impersonar')
  impersonar(@Param('id') id: string, @Body() dto: ImpersonarDto, @Req() req: RequestWithUser) {
    return this.superAdminService.impersonarAdmin(id, dto.motivo, req.user.email);
  }
}