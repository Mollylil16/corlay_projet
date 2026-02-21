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
exports.CommandesAchatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommandesAchatService = class CommandesAchatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(filters) {
        const where = {};
        if (filters?.dateDebut)
            where.date = { ...where.date, gte: filters.dateDebut };
        if (filters?.dateFin)
            where.date = { ...where.date, lte: filters.dateFin };
        return this.prisma.commandeAchat.findMany({
            where: Object.keys(where).length ? where : undefined,
            orderBy: { date: 'desc' },
        });
    }
    create(dto) {
        return this.prisma.commandeAchat.create({
            data: {
                date: dto.date,
                fournisseur: dto.fournisseur ?? null,
                typeCarburant: dto.typeCarburant,
                quantiteCommandee: dto.quantiteCommandee,
                quantiteRecue: dto.quantiteRecue,
                commentaire: dto.commentaire ?? null,
            },
        });
    }
};
exports.CommandesAchatService = CommandesAchatService;
exports.CommandesAchatService = CommandesAchatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommandesAchatService);
//# sourceMappingURL=commandes-achat.service.js.map