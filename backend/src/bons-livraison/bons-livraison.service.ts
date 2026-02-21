import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonLivraisonDto } from './dto/create-bon-livraison.dto';
import { UpdateBonLivraisonDto } from './dto/update-bon-livraison.dto';

@Injectable()
export class BonsLivraisonService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.bonLivraison.findMany({ orderBy: { dateEmission: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.bonLivraison.findUnique({ where: { id } });
  }

  create(dto: CreateBonLivraisonDto) {
    const id = `BL-${Date.now()}`;
    const dateEmission = dto.dateEmission || new Date().toISOString().split('T')[0];
    const statut = dto.statut ?? 'en-attente';
    const signature = dto.signature ?? false;
    return this.prisma.bonLivraison.create({
      data: {
        id,
        numeroCommande: dto.numeroCommande,
        client: dto.client,
        chauffeur: dto.chauffeur,
        vehicule: dto.vehicule,
        typeCarburant: dto.typeCarburant,
        quantiteCommandee: dto.quantiteCommandee,
        quantiteLivree: dto.quantiteLivree ?? null,
        dateEmission,
        heureDepart: dto.heureDepart ?? null,
        statut,
        signature,
        observations: dto.observations ?? null,
      },
    });
  }

  update(id: string, dto: UpdateBonLivraisonDto) {
    return this.prisma.bonLivraison.update({ where: { id }, data: dto });
  }

  updateStatut(id: string, statut: string) {
    return this.prisma.bonLivraison.update({ where: { id }, data: { statut } });
  }
}
