import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepotsService } from './depots.service';
import { CreateDepotDto } from './dto/create-depot.dto';

@Controller('depots')
@UseGuards(JwtAuthGuard)
export class DepotsController {
  constructor(private readonly service: DepotsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateDepotDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':depotId/tanks/:tankId')
  adjustStock(
    @Param('depotId') depotId: string,
    @Param('tankId') tankId: string,
    @Body('percentage') percentage: number,
  ) {
    return this.service.adjustStock(depotId, tankId, percentage);
  }
}
