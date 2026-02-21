import { IncidentsService } from './incidents.service';
export declare class IncidentsController {
    private readonly service;
    constructor(service: IncidentsService);
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
    create(dto: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__IncidentClient<{
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
    updateStatut(id: string, body: {
        statut: string;
        dateResolution?: string;
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
}
