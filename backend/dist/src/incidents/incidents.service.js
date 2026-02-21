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
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IncidentsService = class IncidentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.incident.findMany({
            orderBy: { dateIncident: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.incident.findUnique({ where: { id } });
    }
    create(dto) {
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
    updateStatut(id, statut, dateResolution) {
        return this.prisma.incident.update({
            where: { id },
            data: { statut, dateResolution: dateResolution ?? undefined },
        });
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map