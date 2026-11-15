import { Controller, Get, Post, Body, Patch, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { CajasService } from './cajas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller('cajas')
@UseGuards(JwtAuthGuard)
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get('actual')
  async obtenerCajaActual(@Req() req: RequestWithUser) {
    const caja = await this.cajasService.obtenerCajaAbierta(req.user.empresaId, req.user.sucursalId);
    return caja || null; 
  }

  @Get('resumen')
  async obtenerResumen(@Req() req: RequestWithUser) {
    const caja = await this.cajasService.obtenerCajaAbierta(req.user.empresaId, req.user.sucursalId);
    if (!caja) throw new NotFoundException('No hay caja abierta');
    return this.cajasService.obtenerResumen(caja.id, req.user.empresaId);
  }

  @Post('abrir')
  abrirCaja(@Body() dto: AbrirCajaDto, @Req() req: RequestWithUser) {
    const sucursal = dto.sucursalId || req.user.sucursalId;
    return this.cajasService.abrir(req.user.empresaId, sucursal, req.user.id, dto.montoInicial);
  }

  @Post('movimientos')
  async registrarMovimiento(@Body() dto: CreateMovimientoDto, @Req() req: RequestWithUser) {
    const caja = await this.cajasService.obtenerCajaAbierta(req.user.empresaId, req.user.sucursalId);
    if (!caja) throw new NotFoundException('No hay caja abierta');
    return this.cajasService.registrarMovimiento(caja.id, req.user.empresaId, dto.tipo, dto.monto, dto.motivo, req.user.id);
  }

  @Patch('cerrar')
  async cerrarCaja(@Body() dto: CerrarCajaDto, @Req() req: RequestWithUser) {
    const caja = await this.cajasService.obtenerCajaAbierta(req.user.empresaId, req.user.sucursalId);
    if (!caja) throw new NotFoundException('No hay caja abierta');
    return this.cajasService.cerrar(caja.id, req.user.empresaId, dto.saldoFinal, req.user.id);
  }
}