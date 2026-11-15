import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from './enums/rol.enum'; // <-- IMPORTAMOS EL ENUM

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.SUPER_ADMIN)
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req: any) {
    createUsuarioDto.empresaId = req.user.empresaId;
    
    if (req.user.rol !== Rol.SUPER_ADMIN) {
      if (createUsuarioDto.rol === Rol.SUPER_ADMIN) {
        throw new ForbiddenException('No podés crear un Super Admin');
      }
      // USAMOS EL ENUM ACÁ
      createUsuarioDto.rol = createUsuarioDto.rol || Rol.CAJERO; 
    }
    
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.SUPER_ADMIN)
  findAll(@Request() req: any) {
    return this.usuariosService.findAll(req.user.empresaId);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Request() req: any) {
    if (req.user.rol !== Rol.SUPER_ADMIN && updateUsuarioDto.rol === Rol.SUPER_ADMIN) {
      throw new ForbiddenException('No podés asignar el rol de Super Admin');
    }
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}