import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IncidentsService } from './incidents.service';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Record<string, unknown>) {
    return this.service.create(dto as Parameters<IncidentsService['create']>[0]);
  }

  @Patch(':id/statut')
  updateStatut(
    @Param('id') id: string,
    @Body() body: { statut: string; dateResolution?: string },
  ) {
    return this.service.updateStatut(id, body.statut, body.dateResolution);
  }
}
