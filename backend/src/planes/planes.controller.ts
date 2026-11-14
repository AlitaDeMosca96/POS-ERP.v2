import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { CreatePlanDto } from './dto/create-plane.dto';
import { UpdatePlanDto } from './dto/update-plane.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('planes')
@UseGuards(JwtAuthGuard)
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.planesService.create(createPlanDto);
  }

  @Get()
  findAll(@Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.planesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.planesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.planesService.update(id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN') throw new ForbiddenException('No autorizado');
    return this.planesService.remove(id);
  }
}