import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransporteurDto } from './dto/create-transporteur.dto';
import { UpdateTransporteurDto } from './dto/update-transporteur.dto';

@Injectable()
export class TransporteursService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.transporteur.findMany({
      orderBy: { nom: 'asc' },
      include: { camions: { include: { compartiments: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.transporteur.findUnique({
      where: { id },
      include: { camions: { include: { compartiments: { orderBy: { ordre: 'asc' } } } } },
    });
  }

  create(dto: CreateTransporteurDto) {
    const dateCreation = new Date().toISOString();
    return this.prisma.transporteur.create({
      data: {
        nom: dto.nom,
        telephone: dto.telephone,
        nomContact: dto.nomContact ?? null,
        adresse: dto.adresse ?? null,
        email: dto.email ?? null,
        couleur: dto.couleur ?? null,
        dateCreation,
      },
      include: { camions: true },
    });
  }

  update(id: string, dto: UpdateTransporteurDto) {
    return this.prisma.transporteur.update({
      where: { id },
      data: {
        ...(dto.nom != null && { nom: dto.nom }),
        ...(dto.telephone != null && { telephone: dto.telephone }),
        ...(dto.nomContact !== undefined && { nomContact: dto.nomContact }),
        ...(dto.adresse !== undefined && { adresse: dto.adresse }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.couleur !== undefined && { couleur: dto.couleur }),
      },
      include: { camions: { include: { compartiments: true } } },
    });
  }

  async remove(id: string) {
    const camions = await this.prisma.camion.findMany({ where: { transporteurId: id }, select: { id: true } });
    for (const c of camions) {
      const nbTournees = await this.prisma.tournee.count({ where: { camionId: c.id } });
      if (nbTournees > 0) {
        throw new ConflictException(
          'Impossible de supprimer cette compagnie : au moins un de ses camions a des tournées.',
        );
      }
    }
    await this.prisma.transporteur.delete({ where: { id } });
  }
}
