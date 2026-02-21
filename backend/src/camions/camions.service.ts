import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCamionDto } from './dto/create-camion.dto';

@Injectable()
export class CamionsService {
  constructor(private prisma: PrismaService) {}

  findAll(transporteurId?: string) {
    const where = transporteurId ? { transporteurId } : {};
    return this.prisma.camion.findMany({
      where,
      orderBy: { immatriculation: 'asc' },
      include: { transporteur: true, compartiments: { orderBy: { ordre: 'asc' } } },
    });
  }

  findOne(id: string) {
    return this.prisma.camion.findUnique({
      where: { id },
      include: { transporteur: true, compartiments: { orderBy: { ordre: 'asc' } } },
    });
  }

  /** Capacité totale = somme des capacités des compartiments (en litres). */
  getCapaciteTotaleLitres(camion: { compartiments: { capaciteLitres: number }[] }): number {
    return (camion.compartiments || []).reduce((s, c) => s + c.capaciteLitres, 0);
  }

  async create(dto: CreateCamionDto) {
    const transporteur = await this.prisma.transporteur.findUnique({ where: { id: dto.transporteurId } });
    if (!transporteur) throw new BadRequestException('Transporteur introuvable');
    if (!dto.compartiments?.length) throw new BadRequestException('Au moins un compartiment est requis (ordre + capacité en L).');

    const dateCreation = new Date().toISOString();
    const camion = await this.prisma.camion.create({
      data: {
        transporteurId: dto.transporteurId,
        immatriculation: dto.immatriculation.trim(),
        marque: dto.marque?.trim() ?? null,
        couleur: dto.couleur?.trim() ?? null,
        statut: dto.statut ?? 'disponible',
        chauffeur: dto.chauffeur?.trim() ?? null,
        telephoneChauffeur: dto.telephoneChauffeur?.trim() ?? null,
        dateCreation,
      },
    });
    for (const comp of dto.compartiments) {
      await this.prisma.compartiment.create({
        data: {
          camionId: camion.id,
          ordre: comp.ordre,
          capaciteLitres: comp.capaciteLitres,
        },
      });
    }
    return this.prisma.camion.findUnique({
      where: { id: camion.id },
      include: { transporteur: true, compartiments: { orderBy: { ordre: 'asc' } } },
    });
  }

  update(id: string, data: Partial<{ marque: string; couleur: string; statut: string; chauffeur: string; telephoneChauffeur: string }>) {
    return this.prisma.camion.update({
      where: { id },
      data: {
        ...(data.marque !== undefined && { marque: data.marque }),
        ...(data.couleur !== undefined && { couleur: data.couleur }),
        ...(data.statut !== undefined && { statut: data.statut }),
        ...(data.chauffeur !== undefined && { chauffeur: data.chauffeur }),
        ...(data.telephoneChauffeur !== undefined && { telephoneChauffeur: data.telephoneChauffeur }),
      },
      include: { transporteur: true, compartiments: { orderBy: { ordre: 'asc' } } },
    });
  }

  async remove(id: string) {
    const nbTournees = await this.prisma.tournee.count({ where: { camionId: id } });
    if (nbTournees > 0) {
      throw new ConflictException('Impossible de supprimer ce camion : il a des tournées associées...');
    }
    await this.prisma.camion.delete({ where: { id } });
  }
}
