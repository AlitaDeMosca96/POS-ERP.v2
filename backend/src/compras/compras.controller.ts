import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('compras')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  create(@Body() createCompraDto: CreateCompraDto, @Req() req: RequestWithUser) {
    return this.comprasService.create(createCompraDto, req.user.empresaId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.comprasService.findAll(req.user.empresaId);
  }
}