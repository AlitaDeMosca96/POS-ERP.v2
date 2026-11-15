import { Controller, Get, Post, Body, Patch, Param, Req, Query, UseGuards } from '@nestjs/common';
import { CajasService } from './cajas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class AbrirCajaDto {
  montoInicial: number;
  sucursalId?: string;
}

export class CerrarCajaDto {
  saldoFinal: number;
}

@Controller('cajas')
@UseGuards(JwtAuthGuard) // <-- ESTO EVITA EL ERROR 500
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get('actual')
  async obtenerCajaActual(@Req() req: any, @Query('sucursalId') sucursalId: string) {
    const sucursal = sucursalId || req.user.sucursalId;
    const caja = await this.cajasService.obtenerCajaAbierta(req.user.empresaId, sucursal);
    return caja || null; 
  }

  @Post('abrir')
  abrirCaja(@Body() dto: AbrirCajaDto, @Req() req: any) {
    const sucursal = dto.sucursalId || req.user.sucursalId;
    return this.cajasService.abrir(req.user.empresaId, sucursal, req.user.id, dto.montoInicial);
  }

  @Patch(':id/cerrar')
  cerrarCaja(@Param('id') id: string, @Body() dto: CerrarCajaDto, @Req() req: any) {
    return this.cajasService.cerrar(id, req.user.empresaId, dto.saldoFinal, req.user.id);
  }
}