import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() createProductoDto: CreateProductoDto, @Req() req: RequestWithUser) {
    createProductoDto.empresaId = req.user.empresaId;
    return this.productosService.create(createProductoDto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.productosService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productosService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto, @Req() req: RequestWithUser) {
    return this.productosService.update(id, updateProductoDto, req.user.empresaId, req.user.id);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productosService.remove(id, req.user.empresaId);
  }
}