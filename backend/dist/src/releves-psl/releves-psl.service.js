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
exports.RelevesPslService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function getStockTheoriqueByType(tanks, typeCarburant) {
    const typeLower = typeCarburant.toLowerCase();
    const isDiesel = typeLower.includes('diesel');
    const isEssence = typeLower.includes('essence');
    return tanks.reduce((sum, t) => {
        const tLower = (t.type || '').toLowerCase();
        if (isDiesel && tLower.includes('diesel'))
            return sum + (t.current || 0);
        if (isEssence && tLower.includes('essence'))
            return sum + (t.current || 0);
        if (!isDiesel && !isEssence)
            return sum + (t.current || 0);
        return sum;
    }, 0);
}
let RelevesPslService = class RelevesPslService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStockTheoriqueActuel() {
        const depots = await this.prisma.depot.findMany({ include: { tanks: true } });
        const allTanks = depots.flatMap((d) => d.tanks);
        const diesel = getStockTheoriqueByType(allTanks, 'diesel');
        const essence = getStockTheoriqueByType(allTanks, 'essence');
        return { diesel, essence };
    }
    async findAll(filters) {
        const where = {};
        if (filters?.dateDebut)
            where.date = { ...where.date, gte: filters.dateDebut };
        if (filters?.dateFin)
            where.date = { ...where.date, lte: filters.dateFin };
        return this.prisma.releveStockPSL.findMany({
            where: Object.keys(where).length ? where : undefined,
            orderBy: [{ date: 'desc' }, { typeCarburant: 'asc' }],
        });
    }
    async create(dto) {
        const depots = await this.prisma.depot.findMany({ include: { tanks: true } });
        const allTanks = depots.flatMap((d) => d.tanks);
        const stockTheorique = getStockTheoriqueByType(allTanks, dto.typeCarburant);
        return this.prisma.releveStockPSL.upsert({
            where: {
                date_typeCarburant: { date: dto.date, typeCarburant: dto.typeCarburant },
            },
            create: {
                date: dto.date,
                typeCarburant: dto.typeCarburant,
                quantiteDeclareePSL: dto.quantiteDeclareePSL,
                stockTheorique,
                commentaire: dto.commentaire ?? null,
            },
            update: {
                quantiteDeclareePSL: dto.quantiteDeclareePSL,
                stockTheorique,
                commentaire: dto.commentaire ?? null,
            },
        });
    }
};
exports.RelevesPslService = RelevesPslService;
exports.RelevesPslService = RelevesPslService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RelevesPslService);
//# sourceMappingURL=releves-psl.service.js.map