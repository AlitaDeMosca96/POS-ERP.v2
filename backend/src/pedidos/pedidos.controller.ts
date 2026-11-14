import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto, @Request() req: any) {
    createPedidoDto.empresaId = req.user.empresaId; 
    const targetSucursal = req.user.sucursalId || createPedidoDto.sucursalId;
    if (targetSucursal) createPedidoDto.sucursalId = targetSucursal;
    return this.pedidosService.create(createPedidoDto, req.user.id); 
  }

  @Get()
  findAll(@Request() req: any, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId || querySucursalId || null;
    return this.pedidosService.findAll(req.user.empresaId, targetSucursal);
  }

  @Get('cocina')
  findPendientesCocina(@Request() req: any, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId || querySucursalId || null;
    return this.pedidosService.findPendientesCocina(req.user.empresaId, targetSucursal);
  }

  // --- NUEVA RUTA ---
  @Get('delivery')
  findDelivery(@Request() req: any, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId || querySucursalId || null;
    return this.pedidosService.findDeliveryPendientes(req.user.empresaId, targetSucursal);
  }
  // ------------------

  @Patch(':id/cocina')
  marcarListo(@Param('id') id: string) {
    return this.pedidosService.marcarListo(id);
  }

  @Patch(':id/delivery')
  actualizarEstadoDelivery(@Param('id') id: string, @Body('estadoDelivery') estadoDelivery: string) {
    return this.pedidosService.update(id, { estadoDelivery });
  }

  @Get('mesa/:mesaId')
  findAbiertoByMesa(@Param('mesaId') mesaId: string, @Request() req: any) {
    return this.pedidosService.findAbiertoByMesa(mesaId, req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(id, updatePedidoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(id);
  }
}