import { Controller, Get, Post, Body, Param, Delete, Request } from '@nestjs/common';
import { ModificadoresService } from './modificadores.service';
import { CreateModificadoreDto } from './dto/create-modificadore.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('modificadores')
export class ModificadoresController {
  constructor(private readonly modificadoresService: ModificadoresService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() createModificadoreDto: CreateModificadoreDto, @Request() req: any) {
    return this.modificadoresService.create(createModificadoreDto, req.user.empresaId);
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string, @Request() req: any) {
    return this.modificadoresService.findByProducto(productoId, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.modificadoresService.remove(id, req.user.empresaId);
  }
}