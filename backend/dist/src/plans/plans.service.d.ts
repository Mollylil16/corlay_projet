import { PrismaService } from '../prisma/prisma.service';
export declare class PlansService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        features: any;
        id: string;
        name: string;
        price: number | null;
        period: string;
        color: string;
        icon: string;
        recommended: boolean;
    }[]>;
    findOne(id: string): Promise<{
        features: any;
        id: string;
        name: string;
        price: number | null;
        period: string;
        color: string;
        icon: string;
        recommended: boolean;
    } | null>;
    getSubscriptionByUser(userId: string): Promise<{
        plan: {
            features: any;
            id: string;
            name: string;
            price: number | null;
            period: string;
            color: string;
            icon: string;
            recommended: boolean;
        } | null;
        id: string;
        userId: string;
        planId: string;
        startDate: string;
        endDate: string | null;
    } | null>;
    createSubscription(userId: string, planId: string, endDate?: string | null): Promise<{
        plan: {
            id: string;
            name: string;
            price: number | null;
            period: string;
            color: string;
            icon: string;
            recommended: boolean;
            features: string;
        };
    } & {
        id: string;
        userId: string;
        planId: string;
        startDate: string;
        endDate: string | null;
    }>;
}
