"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourneesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function capaciteCamionLitres(camion) {
    return (camion.compartiments || []).reduce((s, c) => s + c.capaciteLitres, 0);
}
function computeHeureArriveePrevue(heureDepart, dateDepart, bls) {
    const result = new Map();
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
    const out = new Map();
    result.forEach((mins, ordre) => {
        const hh = Math.floor(mins / 60) % 24;
        const mm = mins % 60;
        out.set(ordre, `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    });
    return out;
}
let TourneesService = class TourneesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const camion = await this.prisma.camion.findUnique({
            where: { id: dto.camionId },
            include: { compartiments: true },
        });
        if (!camion) {
            throw new common_1.BadRequestException('Camion introuvable');
        }
        if (camion.statut !== 'disponible') {
            throw new common_1.BadRequestException('Le camion doit être disponible');
        }
        const capacityL = capaciteCamionLitres(camion);
        if (capacityL <= 0) {
            throw new common_1.BadRequestException('Capacité du camion invalide (aucun compartiment ou capacité nulle)');
        }
        const commandes = await this.prisma.commande.findMany({
            where: { id: { in: dto.commandeIds } },
        });
        if (commandes.length !== dto.commandeIds.length) {
            throw new common_1.BadRequestException('Une ou plusieurs commandes sont introuvables');
        }
        const invalidStatut = commandes.find((c) => c.statut !== 'validee');
        if (invalidStatut) {
            throw new common_1.BadRequestException(`La commande ${invalidStatut.id} n'est pas validée pour la logistique (statut: ${invalidStatut.statut})`);
        }
        const existingBls = await this.prisma.bonLivraison.findMany({
            where: { numeroCommande: { in: dto.commandeIds } },
        });
        if (existingBls.length > 0) {
            const ids = existingBls.map((b) => b.numeroCommande);
            throw new common_1.BadRequestException(`Certaines commandes ont déjà un bon de livraison : ${ids.join(', ')}`);
        }
        const totalVolume = commandes.reduce((sum, c) => sum + c.quantite, 0);
        if (totalVolume > capacityL) {
            throw new common_1.BadRequestException(`Volume total (${totalVolume} L) dépasse la capacité du camion (${capacityL} L). Choisissez un camion plus grand ou moins de commandes.`);
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
        const bonsLivraison = await Promise.all(commandes.map((cmd, i) => this.prisma.bonLivraison.create({
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
        })));
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
    async findOne(id) {
        const tournee = await this.prisma.tournee.findUnique({
            where: { id },
            include: { bonsLivraison: true, camion: { include: { transporteur: true, compartiments: true } } },
        });
        if (!tournee)
            return null;
        const etas = computeHeureArriveePrevue(tournee.heureDepartPrevue, tournee.dateDepartPrevue ?? tournee.dateCreation, tournee.bonsLivraison);
        const bonsAvecEta = tournee.bonsLivraison
            .slice()
            .sort((a, b) => (a.ordrePassage ?? 999) - (b.ordrePassage ?? 999))
            .map((bl) => ({
            ...bl,
            heureArriveePrevue: bl.heureArriveePrevue ?? (bl.ordrePassage != null ? etas.get(bl.ordrePassage) ?? null : null),
        }));
        return { ...tournee, bonsLivraison: bonsAvecEta };
    }
    async update(id, data) {
        return this.prisma.tournee.update({
            where: { id },
            data: {
                ...(data.dateDepartPrevue != null && { dateDepartPrevue: data.dateDepartPrevue }),
                ...(data.heureDepartPrevue != null && { heureDepartPrevue: data.heureDepartPrevue }),
            },
        });
    }
};
exports.TourneesService = TourneesService;
exports.TourneesService = TourneesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TourneesService);
//# sourceMappingURL=tournees.service.js.map