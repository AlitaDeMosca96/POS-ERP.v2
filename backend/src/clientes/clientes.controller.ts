import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.MOZO, Rol.CAJERO)
  create(@Body() createClienteDto: CreateClienteDto, @Request() req: any) {
    createClienteDto.empresaId = req.user.empresaId;
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.clientesService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.clientesService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.MOZO, Rol.CAJERO)
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto, @Request() req: any) {
    return this.clientesService.update(id, updateClienteDto, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.clientesService.remove(id, req.user.empresaId);
  }
}