import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.MOZO, Rol.CAJERO)
  create(@Body() createReservaDto: CreateReservaDto, @Request() req: any) {
    createReservaDto.empresaId = req.user.empresaId;
    return this.reservasService.create(createReservaDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.reservasService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.reservasService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.MOZO, Rol.CAJERO)
  update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto, @Request() req: any) {
    return this.reservasService.update(id, updateReservaDto, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.MOZO, Rol.CAJERO)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.reservasService.remove(id, req.user.empresaId);
  }
}