import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { AnularPedidoDto } from './dto/anular-pedido.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO)
  create(@Body() createPedidoDto: CreatePedidoDto, @Req() req: RequestWithUser) {
    createPedidoDto.empresaId = req.user.empresaId;
    const targetSucursal = req.user.sucursalId || createPedidoDto.sucursalId;
    if (targetSucursal) createPedidoDto.sucursalId = targetSucursal;
    return this.pedidosService.create(createPedidoDto, req.user.id, req.user.empresaId);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO, Rol.COCINA)
  findAll(
    @Req() req: RequestWithUser,
    @Query('sucursalId') querySucursalId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.pedidosService.findAll(req.user.empresaId, targetSucursal, Number(page), Number(limit));
  }

  @Get('cocina')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO, Rol.COCINA)
  findPendientesCocina(@Req() req: RequestWithUser, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.pedidosService.findPendientesCocina(req.user.empresaId, targetSucursal);
  }

  @Get('delivery')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO)
  findDelivery(@Req() req: RequestWithUser, @Query('sucursalId') querySucursalId?: string) {
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.pedidosService.findDeliveryPendientes(req.user.empresaId, targetSucursal);
  }

  @Patch(':id/cocina')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.COCINA)
  marcarListo(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.pedidosService.marcarListo(id, req.user.empresaId);
  }

  @Patch(':id/delivery')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO)
  actualizarEstadoDelivery(@Param('id') id: string, @Body('estadoDelivery') estadoDelivery: string, @Req() req: RequestWithUser) {
    return this.pedidosService.update(id, { estadoDelivery }, req.user.empresaId);
  }

  @Patch(':id/anular')
  @Roles(Rol.ADMIN, Rol.CAJERO)
  anularPedido(@Param('id') id: string, @Body() dto: AnularPedidoDto, @Req() req: RequestWithUser) {
    return this.pedidosService.anular(id, req.user.empresaId, dto.motivo, req.user.id);
  }

  @Get('mesa/:mesaId')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO, Rol.COCINA)
  findAbiertoByMesa(@Param('mesaId') mesaId: string, @Req() req: RequestWithUser) {
    return this.pedidosService.findAbiertoByMesa(mesaId, req.user.empresaId);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO, Rol.COCINA)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.pedidosService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.COCINA)
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto, @Req() req: RequestWithUser) {
    return this.pedidosService.update(id, updatePedidoDto, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.pedidosService.remove(id, req.user.empresaId, req.user.id);
  }
}