import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BonsLivraisonService } from './bons-livraison.service';
import { CreateBonLivraisonDto } from './dto/create-bon-livraison.dto';
import { UpdateBonLivraisonDto } from './dto/update-bon-livraison.dto';

@Controller('bons-livraison')
@UseGuards(JwtAuthGuard)
export class BonsLivraisonController {
  constructor(private readonly service: BonsLivraisonService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBonLivraisonDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBonLivraisonDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/statut')
  updateStatut(@Param('id') id: string, @Body('statut') statut: string) {
    return this.service.updateStatut(id, statut);
  }
}
