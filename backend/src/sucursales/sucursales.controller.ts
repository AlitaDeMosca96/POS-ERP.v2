import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursale.dto';
import { UpdateSucursalDto } from './dto/update-sucursale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sucursales')
@UseGuards(JwtAuthGuard)
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Post()
  create(@Body() createSucursalDto: CreateSucursalDto, @Request() req: any) {
    createSucursalDto.empresaId = req.user.empresaId;
    return this.sucursalesService.create(createSucursalDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.sucursalesService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sucursalesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSucursalDto: UpdateSucursalDto) {
    return this.sucursalesService.update(id, updateSucursalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sucursalesService.remove(id);
  }
}