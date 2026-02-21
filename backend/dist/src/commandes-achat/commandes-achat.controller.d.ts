import { CommandesAchatService } from './commandes-achat.service';
import { CreateCommandeAchatDto } from './dto/create-commande-achat.dto';
export declare class CommandesAchatController {
    private readonly service;
    constructor(service: CommandesAchatService);
    findAll(dateDebut?: string, dateFin?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        date: string;
        typeCarburant: string;
        quantiteCommandee: number;
        commentaire: string | null;
        fournisseur: string | null;
        quantiteRecue: number;
    }[]>;
    create(dto: CreateCommandeAchatDto): import(".prisma/client").Prisma.Prisma__CommandeAchatClient<{
        id: string;
        date: string;
        typeCarburant: string;
        quantiteCommandee: number;
        commentaire: string | null;
        fournisseur: string | null;
        quantiteRecue: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
