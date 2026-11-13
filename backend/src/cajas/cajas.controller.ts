import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
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
    return this.cajasService.abrir(createCajaDto);
  }

  @Get('abierta')
  buscarAbierta(@Request() req: any) {
    return this.cajasService.buscarAbierta(req.user.id, req.user.empresaId);
  }

  @Patch(':id/cierre')
  cerrar(@Param('id') id: string, @Body('saldoFinal') saldoFinal: number) {
    return this.cajasService.cerrar(id, saldoFinal);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.cajasService.findAll(req.user.empresaId);
  }

  // --- NUEVAS RUTAS ---
  @Post('movimientos')
  registrarMovimiento(@Body() dto: CreateMovimientoDto) {
    return this.cajasService.registrarMovimiento(dto);
  }

  @Get(':id/resumen')
  obtenerResumen(@Param('id') id: string) {
    return this.cajasService.obtenerResumen(id);
  }
}