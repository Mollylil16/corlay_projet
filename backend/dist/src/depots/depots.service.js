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
exports.DepotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DepotsService = class DepotsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.depot.findMany({
            include: { tanks: true },
            orderBy: { nom: 'asc' },
        });
    }
    findOne(id) {
        return this.prisma.depot.findUnique({
            where: { id },
            include: { tanks: true },
        });
    }
    async create(dto) {
        const id = `depot-${Date.now()}`;
        const statut = dto.statut ?? 'operationnel';
        const depot = await this.prisma.depot.create({
            data: {
                id,
                nom: dto.nom,
                statut,
            },
        });
        if (dto.tanks && dto.tanks.length > 0) {
            for (let i = 0; i < dto.tanks.length; i++) {
                const t = dto.tanks[i];
                const tankId = `tank-${id}-${i + 1}`;
                const pct = Math.min(100, Math.max(0, t.percentage ?? 0));
                const current = Math.round((pct / 100) * t.capacity);
                await this.prisma.tank.create({
                    data: {
                        id: tankId,
                        depotId: depot.id,
                        tankNumber: t.tankNumber,
                        name: t.name,
                        type: t.type,
                        capacity: t.capacity,
                        percentage: pct,
                        current,
                    },
                });
            }
        }
        return this.prisma.depot.findUnique({
            where: { id: depot.id },
            include: { tanks: true },
        });
    }
    async adjustStock(depotId, tankId, percentage) {
        const tank = await this.prisma.tank.findFirst({
            where: { id: tankId, depotId },
        });
        if (!tank)
            return null;
        const current = Math.round((percentage / 100) * tank.capacity);
        return this.prisma.tank.update({
            where: { id: tankId },
            data: { percentage, current },
        });
    }
};
exports.DepotsService = DepotsService;
exports.DepotsService = DepotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepotsService);
//# sourceMappingURL=depots.service.js.map