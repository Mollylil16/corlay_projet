import { CreateCompartimentDto } from './create-compartiment.dto';
export declare class CreateCamionDto {
    transporteurId: string;
    immatriculation: string;
    marque?: string;
    couleur?: string;
    statut?: string;
    chauffeur?: string;
    telephoneChauffeur?: string;
    compartiments: CreateCompartimentDto[];
}
