import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @Roles(Rol.ADMIN)
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
  @Roles(Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto, @Request() req: any) {
    return this.categoriasService.update(id, updateCategoriaDto, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.categoriasService.remove(id, req.user.empresaId);
  }
}