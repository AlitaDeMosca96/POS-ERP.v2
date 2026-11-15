import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('caja')
@UseGuards(JwtAuthGuard)
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get()
  async obtenerCajaActual(@Req() req: any, @Query('sucursalId') sucursalId: string) {
    // Usamos el sucursalId del query o el del token
    const sucursal = sucursalId || req.user.sucursalId;
    const caja = await this.cajaService.obtenerCajaAbierta(req.user.empresaId, sucursal);
    
    // IMPORTANTE: Si no hay caja, devolvemos null para que el frontend no rompa
    return caja || null; 
  }

  @Post('abrir')
  abrirCaja(@Body() dto: AbrirCajaDto, @Req() req: any) {
    const sucursal = dto.sucursalId || req.user.sucursalId;
    return this.cajaService.abrir(req.user.empresaId, sucursal, req.user.id, dto.montoInicial);
  }

  @Patch(':id/cerrar')
  cerrarCaja(@Param('id') id: string, @Body() dto: CerrarCajaDto, @Req() req: any) {
    return this.cajaService.cerrar(id, req.user.empresaId, dto.saldoFinal, req.user.id);
  }
}