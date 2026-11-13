import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
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
    return this.pedidosService.create(createPedidoDto, req.user.id); 
  }

  @Get()
  findAll(@Request() req: any) {
    return this.pedidosService.findAll(req.user.empresaId);
  }

  @Get('cocina')
  findPendientesCocina(@Request() req: any) {
    return this.pedidosService.findPendientesCocina(req.user.empresaId);
  }

  @Patch(':id/cocina')
  marcarListo(@Param('id') id: string) {
    return this.pedidosService.marcarListo(id);
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