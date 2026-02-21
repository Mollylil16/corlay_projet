import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { ValidationTresorerieDto } from './dto/validation-tresorerie.dto';
import { ValidationFacturationDto } from './dto/validation-facturation.dto';

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.commande.findMany({ orderBy: { date: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.commande.findUnique({ where: { id } });
  }

  create(dto: CreateCommandeDto) {
    const id = `CMD-${Date.now()}`;
    return this.prisma.commande.create({
      data: {
        id,
        client: dto.client,
        type: dto.type,
        quantite: dto.quantite,
        date: dto.date || new Date().toISOString().split('T')[0],
        statut: 'en_attente_tresorerie',
        priorite: dto.priorite || 'normale',
        typeCommande: dto.typeCommande || 'externe',
        referenceCommandeExterne: dto.referenceCommandeExterne ?? null,
        destination: dto.destination?.trim() || null,
      },
    });
  }

  update(id: string, dto: UpdateCommandeDto) {
    return this.prisma.commande.update({ where: { id }, data: dto });
  }

  updateStatut(id: string, statut: string) {
    return this.prisma.commande.update({ where: { id }, data: { statut } });
  }

  async validationTresorerie(id: string, dto: ValidationTresorerieDto) {
    const cmd = await this.prisma.commande.findUnique({ where: { id } });
    if (!cmd) throw new BadRequestException('Commande introuvable');
    if (cmd.statut !== 'en_attente_tresorerie') {
      throw new BadRequestException(`Commande non disponible pour la trésorerie (statut: ${cmd.statut})`);
    }
    const dateValidationTresorerie = new Date().toISOString();
    return this.prisma.commande.update({
      where: { id },
      data: {
        statut: 'valide_tresorerie',
        paiementRecu: dto.paiementRecu,
        moyenPaiement: dto.moyenPaiement ?? null,
        numeroCheque: dto.numeroCheque ?? null,
        numeroTransactionVirement: dto.numeroTransactionVirement ?? null,
        dateValidationTresorerie,
      },
    });
  }

  async validationFacturation(id: string, dto: ValidationFacturationDto) {
    const cmd = await this.prisma.commande.findUnique({ where: { id } });
    if (!cmd) throw new BadRequestException('Commande introuvable');
    if (cmd.statut !== 'valide_tresorerie') {
      throw new BadRequestException(`Commande non disponible pour la facturation (statut: ${cmd.statut})`);
    }
    const dateValidationFacturation = new Date().toISOString();
    return this.prisma.commande.update({
      where: { id },
      data: {
        statut: 'validee',
        numeroBonCommandeInterne: dto.numeroBonCommandeInterne?.trim() || null,
        dateValidationFacturation,
      },
    });
  }
}
