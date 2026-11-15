import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from './enums/rol.enum';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Req() req: any) {
    // Si no es super admin, forzamos que el usuario se cree en su misma empresa
    if (req.user.rol !== Rol.SUPER_ADMIN) {
      createUsuarioDto.empresaId = req.user.empresaId;
      // Evitar que un admin cree otro super admin
      if (createUsuarioDto.rol === Rol.SUPER_ADMIN) {
        throw new ForbiddenException('No tenés permiso para crear un SUPER_ADMIN');
      }
    }
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  findAll(@Req() req: any) {
    // Si es super admin, ve todos. Si es admin, solo los de su empresa.
    return this.usuariosService.findAll(req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.findOne(id, req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Req() req: any) {
    if (req.user.rol !== Rol.SUPER_ADMIN) {
      delete updateUsuarioDto.empresaId; // No puede cambiar de empresa
      if (updateUsuarioDto.rol === Rol.SUPER_ADMIN) {
        throw new ForbiddenException('No tenés permiso para ascender a SUPER_ADMIN');
      }
    }
    return this.usuariosService.update(id, updateUsuarioDto, req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.remove(id, req.user.rol === Rol.SUPER_ADMIN ? undefined : req.user.empresaId);
  }
}