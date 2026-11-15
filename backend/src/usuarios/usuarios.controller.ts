import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Rol } from './enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Req() req: RequestWithUser) {
    if (req.user.rol !== Rol.SUPER_ADMIN) {
      createUsuarioDto.empresaId = req.user.empresaId;
      if (createUsuarioDto.rol === Rol.SUPER_ADMIN) {
        throw new ForbiddenException('No tenés permiso para crear un SUPER_ADMIN');
      }
    }
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  findAll(@Req() req: RequestWithUser) {
    return this.usuariosService.findAll(req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usuariosService.findOne(id, req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Req() req: RequestWithUser) {
    if (req.user.rol !== Rol.SUPER_ADMIN) {
      delete (updateUsuarioDto as any).empresaId;
      if (updateUsuarioDto.rol === Rol.SUPER_ADMIN) {
        throw new ForbiddenException('No tenés permiso para ascender a SUPER_ADMIN');
      }
    }
    return this.usuariosService.update(id, updateUsuarioDto, req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usuariosService.remove(id, req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }
}