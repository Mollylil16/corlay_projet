import { PlansService } from './plans.service';
export declare class PlansController {
    private readonly service;
    constructor(service: PlansService);
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
}
export declare class SubscriptionsController {
    private readonly plansService;
    constructor(plansService: PlansService);
    getMySubscription(req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    create(req: {
        user: {
            id: string;
        };
    }, body: {
        planId: string;
        endDate?: string;
    }): Promise<{
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
