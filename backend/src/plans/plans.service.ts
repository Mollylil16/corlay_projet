import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const plans = await this.prisma.plan.findMany({
      orderBy: { id: 'asc' },
    });
    return plans.map((p) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
    }));
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) return null;
    return {
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : plan.features,
    };
  }

  async getSubscriptionByUser(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { startDate: 'desc' },
      include: { plan: true },
    });
    if (!sub) return null;
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

  async createSubscription(userId: string, planId: string, endDate?: string | null) {
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
}
