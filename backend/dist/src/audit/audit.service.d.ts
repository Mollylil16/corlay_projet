import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        timestamp: string;
        description: string;
        userId: string;
        userName: string;
        action: string;
        entity: string;
        entityId: string;
    }[]>;
    create(dto: {
        userId: string;
        userName: string;
        action: string;
        entity: string;
        entityId: string;
        description: string;
    }): Promise<{
        id: string;
        timestamp: string;
        description: string;
        userId: string;
        userName: string;
        action: string;
        entity: string;
        entityId: string;
    }>;
}
