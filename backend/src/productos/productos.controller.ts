import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() createProductoDto: CreateProductoDto, @Req() req: RequestWithUser) {
    createProductoDto.empresaId = req.user.empresaId;
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO, Rol.COCINA)
  findAll(@Req() req: RequestWithUser) {
    return this.productosService.findAll(req.user.empresaId);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.CAJERO, Rol.MOZO, Rol.COCINA)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productosService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto, @Req() req: RequestWithUser) {
    return this.productosService.update(id, updateProductoDto, req.user.empresaId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productosService.remove(id, req.user.empresaId);
  }
}