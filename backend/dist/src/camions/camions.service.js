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
exports.CamionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CamionsService = class CamionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(transporteurId) {
        const where = transporteurId ? { transporteurId } : {};
        return this.prisma.camion.findMany({
            where,
            orderBy: { immatriculation: 'asc' },
            include: { transporteur: true, compartiments: { orderBy: { ordre: 'asc' } } },
        });
    }
    findOne(id) {
        return this.prisma.camion.findUnique({
            where: { id },
            include: { transporteur: true, compartiments: { orderBy: { ordre: 'asc' } } },
        });
    }
    getCapaciteTotaleLitres(camion) {
        return (camion.compartiments || []).reduce((s, c) => s + c.capaciteLitres, 0);
    }
    async create(dto) {
        const transporteur = await this.prisma.transporteur.findUnique({ where: { id: dto.transporteurId } });
        if (!transporteur)
            throw new common_1.BadRequestException('Transporteur introuvable');
        if (!dto.compartiments?.length)
            throw new common_1.BadRequestException('Au moins un compartiment est requis (ordre + capacité en L).');
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
    update(id, data) {
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
    async remove(id) {
        const nbTournees = await this.prisma.tournee.count({ where: { camionId: id } });
        if (nbTournees > 0) {
            throw new common_1.ConflictException('Impossible de supprimer ce camion : il a des tournées associées.');
        }
        await this.prisma.camion.delete({ where: { id } });
    }
};
exports.CamionsService = CamionsService;
exports.CamionsService = CamionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CamionsService);
//# sourceMappingURL=camions.service.js.map