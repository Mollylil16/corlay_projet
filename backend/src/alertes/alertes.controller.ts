import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertesService } from './alertes.service';
import { CreateAlerteDto } from './dto/create-alerte.dto';

@Controller('alertes')
@UseGuards(JwtAuthGuard)
export class AlertesController {
  constructor(private readonly service: AlertesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAlerteDto) {
    return this.service.create(dto);
  }

  @Patch(':id/lu')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}
