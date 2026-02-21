import { PrismaService } from '../prisma/prisma.service';
export declare class AlertesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        depot: string | null;
        type: string;
        vehicule: string | null;
        severite: string;
        titre: string;
        message: string;
        timestamp: string;
        lu: boolean;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__AlerteClient<{
        id: string;
        depot: string | null;
        type: string;
        vehicule: string | null;
        severite: string;
        titre: string;
        message: string;
        timestamp: string;
        lu: boolean;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    markAsRead(id: string): import(".prisma/client").Prisma.Prisma__AlerteClient<{
        id: string;
        depot: string | null;
        type: string;
        vehicule: string | null;
        severite: string;
        titre: string;
        message: string;
        timestamp: string;
        lu: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    create(dto: {
        type: string;
        severite: string;
        titre: string;
        message: string;
        vehicule?: string;
        depot?: string;
        lu?: boolean;
    }): Promise<{
        id: string;
        depot: string | null;
        type: string;
        vehicule: string | null;
        severite: string;
        titre: string;
        message: string;
        timestamp: string;
        lu: boolean;
    }>;
}
