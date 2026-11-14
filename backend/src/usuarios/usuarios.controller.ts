import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard) // Sigue comentado para el bootstrap
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req: any) {
    // Si hay un usuario logueado (guard activo), usamos su empresaId.
    // Si no (bootstrap), usamos el empresaId que venga en el JSON.
    if (req.user && req.user.empresaId) {
      createUsuarioDto.empresaId = req.user.empresaId;
    }
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll(@Request() req: any) {
    // Si estamos en bootstrap, devolvemos todos (o lo que pida)
    if (req.user && req.user.empresaId) {
      return this.usuariosService.findAll(req.user.empresaId);
    }
    return this.usuariosService.findAll(''); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}