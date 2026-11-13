import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ModificadoresService } from './modificadores.service';
import { CreateModificadoreDto } from './dto/create-modificadore.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('modificadores')
@UseGuards(JwtAuthGuard)
export class ModificadoresController {
  constructor(private readonly modificadoresService: ModificadoresService) {}

  @Post()
  create(@Body() createModificadoreDto: CreateModificadoreDto) {
    return this.modificadoresService.create(createModificadoreDto);
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string) {
    return this.modificadoresService.findByProducto(productoId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modificadoresService.remove(id);
  }
}