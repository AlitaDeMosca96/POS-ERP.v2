import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservas')
@UseGuards(JwtAuthGuard)
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto, @Request() req: any) {
    return this.reservasService.update(id, updateReservaDto, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.reservasService.remove(id, req.user.empresaId);
  }
}