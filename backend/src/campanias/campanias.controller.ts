import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { CampaniasService } from './campanias.service';
import { CreateCampaniaDto } from './dto/create-campania.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('campanias')
export class CampaniasController {
  constructor(private readonly campaniasService: CampaniasService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() createCampaniaDto: CreateCampaniaDto, @Request() req: any) {
    createCampaniaDto.empresaId = req.user.empresaId;
    return this.campaniasService.create(createCampaniaDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.campaniasService.findAll(req.user.empresaId);
  }
}