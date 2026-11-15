import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('insumos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  @Post()
  create(@Body() createInsumoDto: CreateInsumoDto, @Req() req: RequestWithUser) {
    createInsumoDto.empresaId = req.user.empresaId;
    return this.insumosService.create(createInsumoDto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.insumosService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.insumosService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInsumoDto: UpdateInsumoDto, @Req() req: RequestWithUser) {
    return this.insumosService.update(id, updateInsumoDto, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.insumosService.remove(id, req.user.empresaId);
  }
}