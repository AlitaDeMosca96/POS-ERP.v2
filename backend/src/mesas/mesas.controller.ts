import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() createMesaDto: CreateMesaDto, @Request() req: any) {
    createMesaDto.empresaId = req.user.empresaId;
    if (req.user.sucursalId) createMesaDto.sucursalId = req.user.sucursalId;
    return this.mesasService.create(createMesaDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.mesasService.findAll(req.user.empresaId, req.user.sucursalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.mesasService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.MOZO, Rol.CAJERO)
  update(@Param('id') id: string, @Body() updateMesaDto: UpdateMesaDto, @Request() req: any) {
    return this.mesasService.update(id, updateMesaDto, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.mesasService.remove(id, req.user.empresaId);
  }
}