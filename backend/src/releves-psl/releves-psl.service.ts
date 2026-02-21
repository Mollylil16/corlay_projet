import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReleveStockPSLDto } from './dto/create-releve-psl.dto';

/** Retourne le stock théorique actuel (somme des tank.current) pour un type de carburant. */
function getStockTheoriqueByType(tanks: { type: string; current: number }[], typeCarburant: string): number {
  const typeLower = typeCarburant.toLowerCase();
  const isDiesel = typeLower.includes('diesel');
  const isEssence = typeLower.includes('essence');
  return tanks.reduce((sum, t) => {
    const tLower = (t.type || '').toLowerCase();
    if (isDiesel && tLower.includes('diesel')) return sum + (t.current || 0);
    if (isEssence && tLower.includes('essence')) return sum + (t.current || 0);
    if (!isDiesel && !isEssence) return sum + (t.current || 0);
    return sum;
  }, 0);
}

@Injectable()
export class RelevesPslService {
  constructor(private prisma: PrismaService) {}

  /** Calcule le stock théorique actuel par type (depuis les cuves). */
  async getStockTheoriqueActuel(): Promise<Record<string, number>> {
    const depots = await this.prisma.depot.findMany({ include: { tanks: true } });
    const allTanks = depots.flatMap((d) => d.tanks);
    const diesel = getStockTheoriqueByType(allTanks, 'diesel');
    const essence = getStockTheoriqueByType(allTanks, 'essence');
    return { diesel, essence };
  }

  async findAll(filters?: { dateDebut?: string; dateFin?: string }) {
    const where: { date?: { gte?: string; lte?: string } } = {};
    if (filters?.dateDebut) where.date = { ...where.date, gte: filters.dateDebut };
    if (filters?.dateFin) where.date = { ...where.date, lte: filters.dateFin };
    return this.prisma.releveStockPSL.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: [{ date: 'desc' }, { typeCarburant: 'asc' }],
    });
  }

  async create(dto: CreateReleveStockPSLDto) {
    const depots = await this.prisma.depot.findMany({ include: { tanks: true } });
    const allTanks = depots.flatMap((d) => d.tanks);
    const stockTheorique = getStockTheoriqueByType(allTanks, dto.typeCarburant);

    return this.prisma.releveStockPSL.upsert({
      where: {
        date_typeCarburant: { date: dto.date, typeCarburant: dto.typeCarburant },
      },
      create: {
        date: dto.date,
        typeCarburant: dto.typeCarburant,
        quantiteDeclareePSL: dto.quantiteDeclareePSL,
        stockTheorique,
        commentaire: dto.commentaire ?? null,
      },
      update: {
        quantiteDeclareePSL: dto.quantiteDeclareePSL,
        stockTheorique,
        commentaire: dto.commentaire ?? null,
      },
    });
  }
}
