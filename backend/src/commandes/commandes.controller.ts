import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { ValidationTresorerieDto } from './dto/validation-tresorerie.dto';
import { ValidationFacturationDto } from './dto/validation-facturation.dto';

@Controller('commandes')
@UseGuards(JwtAuthGuard)
export class CommandesController {
  constructor(private readonly service: CommandesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCommandeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommandeDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/statut')
  updateStatut(@Param('id') id: string, @Body('statut') statut: string) {
    return this.service.updateStatut(id, statut);
  }

  @Patch(':id/validation-tresorerie')
  validationTresorerie(@Param('id') id: string, @Body() dto: ValidationTresorerieDto) {
    return this.service.validationTresorerie(id, dto);
  }

  @Patch(':id/validation-facturation')
  validationFacturation(@Param('id') id: string, @Body() dto: ValidationFacturationDto) {
    return this.service.validationFacturation(id, dto);
  }
}
