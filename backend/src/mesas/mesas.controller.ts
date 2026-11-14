import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mesas')
@UseGuards(JwtAuthGuard)
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  create(@Body() createMesaDto: CreateMesaDto, @Request() req: any) {
    createMesaDto.empresaId = req.user.empresaId;
    if (req.user.sucursalId) {
      createMesaDto.sucursalId = req.user.sucursalId;
    }
    return this.mesasService.create(createMesaDto);
  }

  @Get()
  findAll(@Request() req: any, @Query('sucursalId') querySucursalId?: string) {
    // SOLO usamos el de la URL si es Admin. Si es empleado, mandamos el del Token.
    const targetSucursal = req.user.sucursalId ? req.user.sucursalId : (querySucursalId || null);
    return this.mesasService.findAll(req.user.empresaId, targetSucursal);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mesasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMesaDto: UpdateMesaDto) {
    return this.mesasService.update(id, updateMesaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mesasService.remove(id);
  }
}