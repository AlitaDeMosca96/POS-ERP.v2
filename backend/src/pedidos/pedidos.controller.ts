import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { AnularPedidoDto } from './dto/anular-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto, @Req() req: RequestWithUser) {
    createPedidoDto.empresaId = req.user.empresaId; 
    const targetSucursal = req.user.sucursalId || createPedidoDto.sucursalId;
    if (targetSucursal) createPedidoDto.sucursalId = targetSucursal;
    return this.pedidosService.create(createPedidoDto, req.user.id, req.user.empresaId); 
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.pedidosService.findAll(req.user.empresaId, targetSucursal);
  }

  @Get('cocina')
  findPendientesCocina(@Req() req: RequestWithUser, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.pedidosService.findPendientesCocina(req.user.empresaId, targetSucursal);
  }

  @Get('delivery')
  findDelivery(@Req() req: RequestWithUser, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.pedidosService.findDeliveryPendientes(req.user.empresaId, targetSucursal);
  }

  @Patch(':id/cocina')
  marcarListo(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.pedidosService.marcarListo(id, req.user.empresaId);
  }

  @Patch(':id/delivery')
  actualizarEstadoDelivery(@Param('id') id: string, @Body('estadoDelivery') estadoDelivery: string, @Req() req: RequestWithUser) {
    return this.pedidosService.update(id, { estadoDelivery }, req.user.empresaId);
  }

  @Patch(':id/anular')
  anularPedido(@Param('id') id: string, @Body() dto: AnularPedidoDto, @Req() req: RequestWithUser) {
    return this.pedidosService.anular(id, req.user.empresaId, dto.motivo, req.user.id);
  }

  @Get('mesa/:mesaId')
  findAbiertoByMesa(@Param('mesaId') mesaId: string, @Req() req: RequestWithUser) {
    return this.pedidosService.findAbiertoByMesa(mesaId, req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.pedidosService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto, @Req() req: RequestWithUser) {
    return this.pedidosService.update(id, updatePedidoDto, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.pedidosService.remove(id, req.user.empresaId);
  }
}