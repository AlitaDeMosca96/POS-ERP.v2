import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('proveedores')
@UseGuards(JwtAuthGuard)
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  create(@Body() createProveedoreDto: CreateProveedoreDto, @Request() req: any) {
    createProveedoreDto.empresaId = req.user.empresaId;
    return this.proveedoresService.create(createProveedoreDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.proveedoresService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.proveedoresService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProveedoreDto: UpdateProveedoreDto, @Request() req: any) {
    return this.proveedoresService.update(id, updateProveedoreDto, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.proveedoresService.remove(id, req.user.empresaId);
  }
}