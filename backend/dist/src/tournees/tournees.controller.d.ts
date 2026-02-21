import { TourneesService } from './tournees.service';
import { CreateTourneeDto } from './dto/create-tournee.dto';
import { UpdateTourneeDto } from './dto/update-tournee.dto';
export declare class TourneesController {
    private readonly service;
    constructor(service: TourneesService);
    create(dto: CreateTourneeDto): Promise<{
        tournee: ({
            camion: {
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
            };
            bonsLivraison: {
                id: string;
                client: string;
                statut: string;
                chauffeur: string;
                numeroCommande: string;
                vehicule: string;
                typeCarburant: string;
                quantiteCommandee: number;
                quantiteLivree: number | null;
                dateEmission: string;
                heureDepart: string | null;
                signature: boolean;
                observations: string | null;
                dateLivraison: string | null;
                heureArrivee: string | null;
                ordrePassage: number | null;
                dureeTrajetMinutes: number | null;
                dureeDechargementMinutes: number | null;
                heureArriveePrevue: string | null;
                tourneeId: string | null;
            }[];
        } & {
            id: string;
            dateCreation: string;
            statut: string;
            camionId: string;
            dateDepartPrevue: string | null;
            heureDepartPrevue: string | null;
        }) | null;
        bonsLivraison: {
            id: string;
            client: string;
            statut: string;
            chauffeur: string;
            numeroCommande: string;
            vehicule: string;
            typeCarburant: string;
            quantiteCommandee: number;
            quantiteLivree: number | null;
            dateEmission: string;
            heureDepart: string | null;
            signature: boolean;
            observations: string | null;
            dateLivraison: string | null;
            heureArrivee: string | null;
            ordrePassage: number | null;
            dureeTrajetMinutes: number | null;
            dureeDechargementMinutes: number | null;
            heureArriveePrevue: string | null;
            tourneeId: string | null;
        }[];
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        camion: {
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
        };
        bonsLivraison: {
            id: string;
            client: string;
            statut: string;
            chauffeur: string;
            numeroCommande: string;
            vehicule: string;
            typeCarburant: string;
            quantiteCommandee: number;
            quantiteLivree: number | null;
            dateEmission: string;
            heureDepart: string | null;
            signature: boolean;
            observations: string | null;
            dateLivraison: string | null;
            heureArrivee: string | null;
            ordrePassage: number | null;
            dureeTrajetMinutes: number | null;
            dureeDechargementMinutes: number | null;
            heureArriveePrevue: string | null;
            tourneeId: string | null;
        }[];
    } & {
        id: string;
        dateCreation: string;
        statut: string;
        camionId: string;
        dateDepartPrevue: string | null;
        heureDepartPrevue: string | null;
    })[]>;
    findOne(id: string): Promise<{
        bonsLivraison: {
            heureArriveePrevue: string | null;
            id: string;
            client: string;
            statut: string;
            chauffeur: string;
            numeroCommande: string;
            vehicule: string;
            typeCarburant: string;
            quantiteCommandee: number;
            quantiteLivree: number | null;
            dateEmission: string;
            heureDepart: string | null;
            signature: boolean;
            observations: string | null;
            dateLivraison: string | null;
            heureArrivee: string | null;
            ordrePassage: number | null;
            dureeTrajetMinutes: number | null;
            dureeDechargementMinutes: number | null;
            tourneeId: string | null;
        }[];
        camion: {
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
        };
        id: string;
        dateCreation: string;
        statut: string;
        camionId: string;
        dateDepartPrevue: string | null;
        heureDepartPrevue: string | null;
    } | null>;
    update(id: string, dto: UpdateTourneeDto): Promise<{
        id: string;
        dateCreation: string;
        statut: string;
        camionId: string;
        dateDepartPrevue: string | null;
        heureDepartPrevue: string | null;
    }>;
}
