import { CamionsService } from './camions.service';
import { CreateCamionDto } from './dto/create-camion.dto';
export declare class CamionsController {
    private readonly service;
    constructor(service: CamionsService);
    findAll(transporteurId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        transporteur: {
            id: string;
            email: string | null;
            nom: string;
            telephone: string;
            dateCreation: string;
            nomContact: string | null;
            adresse: string | null;
            couleur: string | null;
        };
        compartiments: {
            id: string;
            ordre: number;
            camionId: string;
            capaciteLitres: number;
        }[];
    } & {
        id: string;
        dateCreation: string;
        statut: string;
        couleur: string | null;
        transporteurId: string;
        immatriculation: string;
        marque: string | null;
        chauffeur: string | null;
        telephoneChauffeur: string | null;
        missions: number;
        tauxReussite: number;
        ponctualite: number;
        note: number;
        dernierePosition: string | null;
        prochaineMaintenance: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CamionClient<({
        transporteur: {
            id: string;
            email: string | null;
            nom: string;
            telephone: string;
            dateCreation: string;
            nomContact: string | null;
            adresse: string | null;
            couleur: string | null;
        };
        compartiments: {
            id: string;
            ordre: number;
            camionId: string;
            capaciteLitres: number;
        }[];
    } & {
        id: string;
        dateCreation: string;
        statut: string;
        couleur: string | null;
        transporteurId: string;
        immatriculation: string;
        marque: string | null;
        chauffeur: string | null;
        telephoneChauffeur: string | null;
        missions: number;
        tauxReussite: number;
        ponctualite: number;
        note: number;
        dernierePosition: string | null;
        prochaineMaintenance: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(dto: CreateCamionDto): Promise<({
        transporteur: {
            id: string;
            email: string | null;
            nom: string;
            telephone: string;
            dateCreation: string;
            nomContact: string | null;
            adresse: string | null;
            couleur: string | null;
        };
        compartiments: {
            id: string;
            ordre: number;
            camionId: string;
            capaciteLitres: number;
        }[];
    } & {
        id: string;
        dateCreation: string;
        statut: string;
        couleur: string | null;
        transporteurId: string;
        immatriculation: string;
        marque: string | null;
        chauffeur: string | null;
        telephoneChauffeur: string | null;
        missions: number;
        tauxReussite: number;
        ponctualite: number;
        note: number;
        dernierePosition: string | null;
        prochaineMaintenance: string | null;
    }) | null>;
    update(id: string, body: {
        marque?: string;
        couleur?: string;
        statut?: string;
        chauffeur?: string;
        telephoneChauffeur?: string;
    }): import(".prisma/client").Prisma.Prisma__CamionClient<{
        transporteur: {
            id: string;
            email: string | null;
            nom: string;
            telephone: string;
            dateCreation: string;
            nomContact: string | null;
            adresse: string | null;
            couleur: string | null;
        };
        compartiments: {
            id: string;
            ordre: number;
            camionId: string;
            capaciteLitres: number;
        }[];
    } & {
        id: string;
        dateCreation: string;
        statut: string;
        couleur: string | null;
        transporteurId: string;
        immatriculation: string;
        marque: string | null;
        chauffeur: string | null;
        telephoneChauffeur: string | null;
        missions: number;
        tauxReussite: number;
        ponctualite: number;
        note: number;
        dernierePosition: string | null;
        prochaineMaintenance: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Promise<void>;
}
