import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CajasService } from './cajas.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cajas')
@UseGuards(JwtAuthGuard)
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Post('apertura')
  abrir(@Body() createCajaDto: CreateCajaDto, @Request() req: any) {
    createCajaDto.empresaId = req.user.empresaId;
    createCajaDto.usuarioId = req.user.id;
    const targetSucursal = req.user.sucursalId || createCajaDto.sucursalId;
    if (targetSucursal) createCajaDto.sucursalId = targetSucursal;
    return this.cajasService.abrir(createCajaDto);
  }

  @Get('abierta')
  buscarAbierta(@Request() req: any) {
    return this.cajasService.buscarAbierta(req.user.id, req.user.empresaId);
  }

  @Patch(':id/cierre')
  cerrar(@Param('id') id: string, @Body('saldoFinal') saldoFinal: number, @Request() req: any) {
    return this.cajasService.cerrar(id, saldoFinal, req.user.empresaId);
  }

  @Get()
  findAll(@Request() req: any, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.cajasService.findAll(req.user.empresaId, targetSucursal);
  }

  @Post('movimientos')
  registrarMovimiento(@Body() dto: CreateMovimientoDto, @Request() req: any) {
    return this.cajasService.registrarMovimiento(dto, req.user.empresaId);
  }

  @Get(':id/resumen')
  obtenerResumen(@Param('id') id: string) {
    return this.cajasService.obtenerResumen(id);
  }
}