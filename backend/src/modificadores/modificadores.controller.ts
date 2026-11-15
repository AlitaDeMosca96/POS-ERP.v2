import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ModificadoresService } from './modificadores.service';
import { CreateModificadoreDto } from './dto/create-modificadore.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('modificadores')
@UseGuards(JwtAuthGuard)
export class ModificadoresController {
  constructor(private readonly modificadoresService: ModificadoresService) {}

  @Post()
  create(@Body() createModificadoreDto: CreateModificadoreDto, @Request() req: any) {
    return this.modificadoresService.create(createModificadoreDto, req.user.empresaId);
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string, @Request() req: any) {
    return this.modificadoresService.findByProducto(productoId, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.modificadoresService.remove(id, req.user.empresaId);
  }
}