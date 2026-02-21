import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CamionsService } from './camions.service';
import { CreateCamionDto } from './dto/create-camion.dto';

@Controller('camions')
@UseGuards(JwtAuthGuard)
export class CamionsController {
  constructor(private readonly service: CamionsService) {}

  @Get()
  findAll(@Query('transporteurId') transporteurId?: string) {
    return this.service.findAll(transporteurId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCamionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { marque?: string; couleur?: string; statut?: string; chauffeur?: string; telephoneChauffeur?: string },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
