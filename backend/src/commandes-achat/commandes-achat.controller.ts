import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommandesAchatService } from './commandes-achat.service';
import { CreateCommandeAchatDto } from './dto/create-commande-achat.dto';

@Controller('commandes-achat')
@UseGuards(JwtAuthGuard)
export class CommandesAchatController {
  constructor(private readonly service: CommandesAchatService) {}

  @Get()
  findAll(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.service.findAll({ dateDebut, dateFin });
  }

  @Post()
  create(@Body() dto: CreateCommandeAchatDto) {
    return this.service.create(dto);
  }
}
