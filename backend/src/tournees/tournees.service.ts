import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourneeDto } from './dto/create-tournee.dto';

/** Capacité totale d'un camion = somme des compartiments (litres). */
function capaciteCamionLitres(camion: { compartiments?: { capaciteLitres: number }[] }): number {
  return (camion.compartiments || []).reduce((s, c) => s + c.capaciteLitres, 0);
}

/** Calcule l'heure d'arrivée prévue (HH:mm) pour chaque BL à partir du départ + trajets + déchargements. */
function computeHeureArriveePrevue(
  heureDepart: string | null | undefined,
  dateDepart: string | null | undefined,
  bls: { ordrePassage: number | null; dureeTrajetMinutes: number | null; dureeDechargementMinutes: number | null }[],
): Map<number, string> {
  const result = new Map<number, number>();
  const sorted = [...bls].filter((b) => b.ordrePassage != null).sort((a, b) => (a.ordrePassage ?? 0) - (b.ordrePassage ?? 0));
  const baseDate = dateDepart || new Date().toISOString().split('T')[0];
  const [h = 8, m = 0] = (heureDepart || '08:00').split(':').map((n) => parseInt(n, 10));
  let cumulMinutes = h * 60 + m;
  const dayMinutes = 24 * 60;
  for (const bl of sorted) {
    const ordre = bl.ordrePassage ?? 0;
    cumulMinutes += bl.dureeTrajetMinutes ?? 0;
    result.set(ordre, cumulMinutes % dayMinutes);
    cumulMinutes += bl.dureeDechargementMinutes ?? 0;
  }
  const out = new Map<number, string>();
  result.forEach((mins, ordre) => {
    const hh = Math.floor(mins / 60) % 24;
    const mm = mins % 60;
    out.set(ordre, `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  });
  return out;
}

@Injectable()
export class TourneesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTourneeDto) {
    const camion = await this.prisma.camion.findUnique({
      where: { id: dto.camionId },
      include: { compartiments: true },
    });
    if (!camion) {
      throw new BadRequestException('Camion introuvable');
    }
    if (camion.statut !== 'disponible') {
      throw new BadRequestException('Le camion doit être disponible');
    }

    const capacityL = capaciteCamionLitres(camion);
    if (capacityL <= 0) {
      throw new BadRequestException('Capacité du camion invalide (aucun compartiment ou capacité nulle)');
    }

    const commandes = await this.prisma.commande.findMany({
      where: { id: { in: dto.commandeIds } },
    });
    if (commandes.length !== dto.commandeIds.length) {
      throw new BadRequestException('Une ou plusieurs commandes sont introuvables');
    }

    const invalidStatut = commandes.find((c) => c.statut !== 'validee');
    if (invalidStatut) {
      throw new BadRequestException(
        `La commande ${invalidStatut.id} n'est pas validée pour la logistique (statut: ${invalidStatut.statut})`,
      );
    }

    const existingBls = await this.prisma.bonLivraison.findMany({
      where: { numeroCommande: { in: dto.commandeIds } },
    });
    if (existingBls.length > 0) {
      const ids = existingBls.map((b) => b.numeroCommande);
      throw new BadRequestException(
        `Certaines commandes ont déjà un bon de livraison : ${ids.join(', ')}`,
      );
    }

    const totalVolume = commandes.reduce((sum, c) => sum + c.quantite, 0);
    if (totalVolume > capacityL) {
      throw new BadRequestException(
        `Volume total (${totalVolume} L) dépasse la capacité du camion (${capacityL} L). Choisissez un camion plus grand ou moins de commandes.`,
      );
    }

    const tourneeId = `TOUR-${Date.now()}`;
    const dateCreation = new Date().toISOString();
    const dateEmission = new Date().toISOString().split('T')[0];
    const chauffeur = camion.chauffeur || 'Chauffeur à assigner';
    const vehicule = camion.immatriculation;

    await this.prisma.tournee.create({
      data: {
        id: tourneeId,
        camionId: camion.id,
        statut: 'planifiee',
        dateCreation,
        dateDepartPrevue: null,
      },
    });

    const bonsLivraison = await Promise.all(
      commandes.map((cmd, i) =>
        this.prisma.bonLivraison.create({
          data: {
            id: `BL-${tourneeId}-${i}`,
            tourneeId,
            ordrePassage: i + 1,
            numeroCommande: cmd.id,
            client: cmd.client,
            chauffeur,
            vehicule,
            typeCarburant: cmd.type,
            quantiteCommandee: cmd.quantite,
            quantiteLivree: null,
            dateEmission,
            statut: 'en-attente',
            signature: false,
            observations: cmd.destination ? `Destination: ${cmd.destination}` : null,
          },
        }),
      ),
    );

    await this.prisma.camion.update({
      where: { id: camion.id },
      data: { statut: 'en-mission' },
    });

    const tournee = await this.prisma.tournee.findUnique({
      where: { id: tourneeId },
      include: { bonsLivraison: true, camion: true },
    });

    return { tournee, bonsLivraison };
  }

  findAll() {
    return this.prisma.tournee.findMany({
      orderBy: { dateCreation: 'desc' },
      include: { bonsLivraison: true, camion: { include: { transporteur: true } } },
    });
  }

  async findOne(id: string) {
    const tournee = await this.prisma.tournee.findUnique({
      where: { id },
      include: { bonsLivraison: true, camion: { include: { transporteur: true, compartiments: true } } },
    });
    if (!tournee) return null;
    const etas = computeHeureArriveePrevue(
      tournee.heureDepartPrevue,
      tournee.dateDepartPrevue ?? tournee.dateCreation,
      tournee.bonsLivraison,
    );
    const bonsAvecEta = tournee.bonsLivraison
      .slice()
      .sort((a, b) => (a.ordrePassage ?? 999) - (b.ordrePassage ?? 999))
      .map((bl) => ({
        ...bl,
        heureArriveePrevue: bl.heureArriveePrevue ?? (bl.ordrePassage != null ? etas.get(bl.ordrePassage) ?? null : null),
      }));
    return { ...tournee, bonsLivraison: bonsAvecEta };
  }

  async update(id: string, data: { dateDepartPrevue?: string; heureDepartPrevue?: string }) {
    return this.prisma.tournee.update({
      where: { id },
      data: {
        ...(data.dateDepartPrevue != null && { dateDepartPrevue: data.dateDepartPrevue }),
        ...(data.heureDepartPrevue != null && { heureDepartPrevue: data.heureDepartPrevue }),
      },
    });
  }
}
