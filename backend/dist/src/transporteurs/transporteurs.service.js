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
exports.TransporteursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransporteursService = class TransporteursService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.transporteur.findMany({
            orderBy: { nom: 'asc' },
            include: { camions: { include: { compartiments: true } } },
        });
    }
    findOne(id) {
        return this.prisma.transporteur.findUnique({
            where: { id },
            include: { camions: { include: { compartiments: { orderBy: { ordre: 'asc' } } } } },
        });
    }
    create(dto) {
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
    update(id, dto) {
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
    async remove(id) {
        const camions = await this.prisma.camion.findMany({ where: { transporteurId: id }, select: { id: true } });
        for (const c of camions) {
            const nbTournees = await this.prisma.tournee.count({ where: { camionId: c.id } });
            if (nbTournees > 0) {
                throw new common_1.ConflictException('Impossible de supprimer cette compagnie : au moins un de ses camions a des tournées.');
            }
        }
        await this.prisma.transporteur.delete({ where: { id } });
    }
};
exports.TransporteursService = TransporteursService;
exports.TransporteursService = TransporteursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransporteursService);
//# sourceMappingURL=transporteurs.service.js.map