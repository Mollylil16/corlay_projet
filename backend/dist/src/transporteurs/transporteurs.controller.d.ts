import { TransporteursService } from './transporteurs.service';
import { CreateTransporteurDto } from './dto/create-transporteur.dto';
import { UpdateTransporteurDto } from './dto/update-transporteur.dto';
export declare class TransporteursController {
    private readonly service;
    constructor(service: TransporteursService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        camions: ({
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
        })[];
    } & {
        id: string;
        email: string | null;
        nom: string;
        telephone: string;
        dateCreation: string;
        nomContact: string | null;
        adresse: string | null;
        couleur: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__TransporteurClient<({
        camions: ({
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
        })[];
    } & {
        id: string;
        email: string | null;
        nom: string;
        telephone: string;
        dateCreation: string;
        nomContact: string | null;
        adresse: string | null;
        couleur: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(dto: CreateTransporteurDto): import(".prisma/client").Prisma.Prisma__TransporteurClient<{
        camions: {
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
        }[];
    } & {
        id: string;
        email: string | null;
        nom: string;
        telephone: string;
        dateCreation: string;
        nomContact: string | null;
        adresse: string | null;
        couleur: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateTransporteurDto): import(".prisma/client").Prisma.Prisma__TransporteurClient<{
        camions: ({
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
        })[];
    } & {
        id: string;
        email: string | null;
        nom: string;
        telephone: string;
        dateCreation: string;
        nomContact: string | null;
        adresse: string | null;
        couleur: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Promise<void>;
}
