import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommandeAchatDto } from './dto/create-commande-achat.dto';

@Injectable()
export class CommandesAchatService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { dateDebut?: string; dateFin?: string }) {
    const where: { date?: { gte?: string; lte?: string } } = {};
    if (filters?.dateDebut) where.date = { ...where.date, gte: filters.dateDebut };
    if (filters?.dateFin) where.date = { ...where.date, lte: filters.dateFin };
    return this.prisma.commandeAchat.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { date: 'desc' },
    });
  }

  create(dto: CreateCommandeAchatDto) {
    return this.prisma.commandeAchat.create({
      data: {
        date: dto.date,
        fournisseur: dto.fournisseur ?? null,
        typeCarburant: dto.typeCarburant,
        quantiteCommandee: dto.quantiteCommandee,
        quantiteRecue: dto.quantiteRecue,
        commentaire: dto.commentaire ?? null,
      },
    });
  }
}
