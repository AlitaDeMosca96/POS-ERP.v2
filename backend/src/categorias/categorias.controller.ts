import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto, @Request() req: any) {
    createCategoriaDto.empresaId = req.user.empresaId;
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.categoriasService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.categoriasService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto, @Request() req: any) {
    return this.categoriasService.update(id, updateCategoriaDto, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.categoriasService.remove(id, req.user.empresaId);
  }
}
