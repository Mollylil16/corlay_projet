import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RelevesPslService } from './releves-psl.service';
import { CreateReleveStockPSLDto } from './dto/create-releve-psl.dto';

@Controller('releves-psl')
@UseGuards(JwtAuthGuard)
export class RelevesPslController {
  constructor(private readonly service: RelevesPslService) {}

  @Get('stock-theorique')
  getStockTheoriqueActuel() {
    return this.service.getStockTheoriqueActuel();
  }

  @Get()
  findAll(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.service.findAll({ dateDebut, dateFin });
  }

  @Post()
  create(@Body() dto: CreateReleveStockPSLDto) {
    return this.service.create(dto);
  }
}
