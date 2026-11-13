import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('compras')
@UseGuards(JwtAuthGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  create(@Body() createCompraDto: CreateCompraDto, @Request() req: any) {
    createCompraDto.empresaId = req.user.empresaId;
    return this.comprasService.create(createCompraDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.comprasService.findAll(req.user.empresaId);
  }
}