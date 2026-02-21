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
exports.CommandesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommandesService = class CommandesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.commande.findMany({ orderBy: { date: 'desc' } });
    }
    findOne(id) {
        return this.prisma.commande.findUnique({ where: { id } });
    }
    create(dto) {
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
    update(id, dto) {
        return this.prisma.commande.update({ where: { id }, data: dto });
    }
    updateStatut(id, statut) {
        return this.prisma.commande.update({ where: { id }, data: { statut } });
    }
    async validationTresorerie(id, dto) {
        const cmd = await this.prisma.commande.findUnique({ where: { id } });
        if (!cmd)
            throw new common_1.BadRequestException('Commande introuvable');
        if (cmd.statut !== 'en_attente_tresorerie') {
            throw new common_1.BadRequestException(`Commande non disponible pour la trésorerie (statut: ${cmd.statut})`);
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
    async validationFacturation(id, dto) {
        const cmd = await this.prisma.commande.findUnique({ where: { id } });
        if (!cmd)
            throw new common_1.BadRequestException('Commande introuvable');
        if (cmd.statut !== 'valide_tresorerie') {
            throw new common_1.BadRequestException(`Commande non disponible pour la facturation (statut: ${cmd.statut})`);
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
};
exports.CommandesService = CommandesService;
exports.CommandesService = CommandesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommandesService);
//# sourceMappingURL=commandes.service.js.map