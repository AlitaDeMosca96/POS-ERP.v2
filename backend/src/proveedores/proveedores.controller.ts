import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('proveedores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  create(@Body() createProveedoreDto: CreateProveedoreDto, @Req() req: RequestWithUser) {
    createProveedoreDto.empresaId = req.user.empresaId;
    return this.proveedoresService.create(createProveedoreDto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.proveedoresService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proveedoresService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProveedoreDto: UpdateProveedoreDto, @Req() req: RequestWithUser) {
    return this.proveedoresService.update(id, updateProveedoreDto, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.proveedoresService.remove(id, req.user.empresaId);
  }
}