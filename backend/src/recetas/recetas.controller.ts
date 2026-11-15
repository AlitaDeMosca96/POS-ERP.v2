import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('recetas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  create(@Body() createRecetaDto: CreateRecetaDto, @Req() req: RequestWithUser) {
    return this.recetasService.create(createRecetaDto, req.user.empresaId);
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string, @Req() req: RequestWithUser) {
    return this.recetasService.findByProducto(productoId, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.recetasService.remove(id, req.user.empresaId);
  }
}