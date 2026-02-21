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
exports.AlertesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AlertesService = class AlertesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.alerte.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50,
        });
    }
    findOne(id) {
        return this.prisma.alerte.findUnique({ where: { id } });
    }
    markAsRead(id) {
        return this.prisma.alerte.update({
            where: { id },
            data: { lu: true },
        });
    }
    async create(dto) {
        const id = `alert-${Date.now()}`;
        return this.prisma.alerte.create({
            data: {
                id,
                type: dto.type,
                severite: dto.severite,
                titre: dto.titre,
                message: dto.message,
                vehicule: dto.vehicule ?? null,
                depot: dto.depot ?? null,
                timestamp: new Date().toISOString(),
                lu: dto.lu ?? false,
            },
        });
    }
};
exports.AlertesService = AlertesService;
exports.AlertesService = AlertesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertesService);
//# sourceMappingURL=alertes.service.js.map