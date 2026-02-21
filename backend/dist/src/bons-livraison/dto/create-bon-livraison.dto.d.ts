export declare class CreateBonLivraisonDto {
    numeroCommande: string;
    client: string;
    chauffeur: string;
    vehicule: string;
    typeCarburant: string;
    quantiteCommandee: number;
    quantiteLivree?: number;
    dateEmission?: string;
    heureDepart?: string;
    statut?: string;
    signature?: boolean;
    observations?: string;
}
