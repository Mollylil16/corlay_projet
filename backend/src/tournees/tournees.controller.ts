import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TourneesService } from './tournees.service';
import { CreateTourneeDto } from './dto/create-tournee.dto';
import { UpdateTourneeDto } from './dto/update-tournee.dto';

@Controller('tournees')
@UseGuards(JwtAuthGuard)
export class TourneesController {
  constructor(private readonly service: TourneesService) {}

  @Post()
  create(@Body() dto: CreateTourneeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTourneeDto) {
    return this.service.update(id, dto);
  }
}
