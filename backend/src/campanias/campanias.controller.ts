import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CampaniasService } from './campanias.service';
import { CreateCampaniaDto } from './dto/create-campania.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('campanias')
@UseGuards(JwtAuthGuard)
export class CampaniasController {
  constructor(private readonly campaniasService: CampaniasService) {}

  @Post()
  create(@Body() createCampaniaDto: CreateCampaniaDto, @Request() req: any) {
    createCampaniaDto.empresaId = req.user.empresaId;
    return this.campaniasService.create(createCampaniaDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.campaniasService.findAll(req.user.empresaId);
  }
}