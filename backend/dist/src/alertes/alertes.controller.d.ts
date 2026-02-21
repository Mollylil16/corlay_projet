import { AlertesService } from './alertes.service';
import { CreateAlerteDto } from './dto/create-alerte.dto';
export declare class AlertesController {
    private readonly service;
    constructor(service: AlertesService);
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
    create(dto: CreateAlerteDto): Promise<{
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
}
