import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursale.dto';
import { UpdateSucursalDto } from './dto/update-sucursale.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() createSucursalDto: CreateSucursalDto, @Request() req: any) {
    createSucursalDto.empresaId = req.user.empresaId;
    return this.sucursalesService.create(createSucursalDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.sucursalesService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.sucursalesService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateSucursalDto: UpdateSucursalDto, @Request() req: any) {
    return this.sucursalesService.update(id, updateSucursalDto, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.sucursalesService.remove(id, req.user.empresaId);
  }
}