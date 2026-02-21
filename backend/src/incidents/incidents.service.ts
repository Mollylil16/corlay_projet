import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.incident.findMany({
      orderBy: { dateIncident: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.incident.findUnique({ where: { id } });
  }

  create(dto: {
    type: string;
    severite: string;
    titre: string;
    description: string;
    statut?: string;
    vehicule?: string;
    chauffeur?: string;
    localisation?: string;
    bl?: string;
    metadata?: string;
  }) {
    const id = `INC-${Date.now()}`;
    return this.prisma.incident.create({
      data: {
        id,
        type: dto.type,
        severite: dto.severite,
        titre: dto.titre,
        description: dto.description,
        statut: dto.statut || 'nouveau',
        vehicule: dto.vehicule ?? null,
        chauffeur: dto.chauffeur ?? null,
        dateIncident: new Date().toISOString(),
        localisation: dto.localisation ?? null,
        bl: dto.bl ?? null,
        metadata: dto.metadata ?? null,
      },
    });
  }

  updateStatut(id: string, statut: string, dateResolution?: string) {
    return this.prisma.incident.update({
      where: { id },
      data: { statut, dateResolution: dateResolution ?? undefined },
    });
  }
}
