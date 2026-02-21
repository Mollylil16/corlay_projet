import { PrismaService } from '../prisma/prisma.service';
export declare class IncidentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        type: string;
        statut: string;
        chauffeur: string | null;
        vehicule: string | null;
        severite: string;
        titre: string;
        description: string;
        dateIncident: string;
        localisation: string | null;
        bl: string | null;
        dateResolution: string | null;
        metadata: string | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__IncidentClient<{
        id: string;
        type: string;
        statut: string;
        chauffeur: string | null;
        vehicule: string | null;
        severite: string;
        titre: string;
        description: string;
        dateIncident: string;
        localisation: string | null;
        bl: string | null;
        dateResolution: string | null;
        metadata: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(dto: {
        type: string;
        severite: string;
        titre: string;
        description: string;
        statut?: string;
        vehicule?: string;
        chauffeur?: string;
        localisation?: string;
        bl?: string;
        metadata?: string;
    }): import(".prisma/client").Prisma.Prisma__IncidentClient<{
        id: string;
        type: string;
        statut: string;
        chauffeur: string | null;
        vehicule: string | null;
        severite: string;
        titre: string;
        description: string;
        dateIncident: string;
        localisation: string | null;
        bl: string | null;
        dateResolution: string | null;
        metadata: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateStatut(id: string, statut: string, dateResolution?: string): import(".prisma/client").Prisma.Prisma__IncidentClient<{
        id: string;
        type: string;
        statut: string;
        chauffeur: string | null;
        vehicule: string | null;
        severite: string;
        titre: string;
        description: string;
        dateIncident: string;
        localisation: string | null;
        bl: string | null;
        dateResolution: string | null;
        metadata: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
