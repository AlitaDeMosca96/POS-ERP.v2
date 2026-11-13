import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recetas')
@UseGuards(JwtAuthGuard)
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  create(@Body() createRecetaDto: CreateRecetaDto) {
    return this.recetasService.create(createRecetaDto);
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId') productoId: string) {
    return this.recetasService.findByProducto(productoId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recetasService.remove(id);
  }
}