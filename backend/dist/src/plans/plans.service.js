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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PlansService = class PlansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const plans = await this.prisma.plan.findMany({
            orderBy: { id: 'asc' },
        });
        return plans.map((p) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
        }));
    }
    async findOne(id) {
        const plan = await this.prisma.plan.findUnique({ where: { id } });
        if (!plan)
            return null;
        return {
            ...plan,
            features: typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : plan.features,
        };
    }
    async getSubscriptionByUser(userId) {
        const sub = await this.prisma.subscription.findFirst({
            where: { userId },
            orderBy: { startDate: 'desc' },
            include: { plan: true },
        });
        if (!sub)
            return null;
        return {
            ...sub,
            plan: sub.plan
                ? {
                    ...sub.plan,
                    features: typeof sub.plan.features === 'string' ? JSON.parse(sub.plan.features || '[]') : sub.plan.features,
                }
                : null,
        };
    }
    async createSubscription(userId, planId, endDate) {
        const startDate = new Date().toISOString().split('T')[0];
        return this.prisma.subscription.create({
            data: {
                userId,
                planId,
                startDate,
                endDate: endDate ?? null,
            },
            include: { plan: true },
        });
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlansService);
//# sourceMappingURL=plans.service.js.map