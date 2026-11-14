import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req: any) {
    createUsuarioDto.empresaId = req.user.empresaId;
    
    // Si no es Super Admin, no puede crear otro Super Admin (máximo puede crear Admins o Cajeros)
    if (req.user.rol !== 'SUPER_ADMIN') {
      if (createUsuarioDto.rol === 'SUPER_ADMIN') {
        throw new ForbiddenException('No podés crear un Super Admin');
      }
      // Si es admin normal, forzamos que el rol sea limitado a su empresa
      createUsuarioDto.rol = createUsuarioDto.rol || 'CAJERO'; 
    }
    
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll(@Request() req: any) {
    return this.usuariosService.findAll(req.user.empresaId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Request() req: any) {
    // Un usuario no puede auto-ascenderse a SUPER_ADMIN
    if (req.user.rol !== 'SUPER_ADMIN' && updateUsuarioDto.rol === 'SUPER_ADMIN') {
      throw new ForbiddenException('No podés asignar el rol de Super Admin');
    }
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string, @Request() req: any) {
    // Evitar que un admin borre a un super admin
    if (req.user.rol !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Solo un Super Admin puede eliminar usuarios de forma definitiva');
    }
    return this.usuariosService.remove(id);
  }
}