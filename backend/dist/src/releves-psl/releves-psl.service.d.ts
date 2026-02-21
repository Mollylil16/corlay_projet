import { PrismaService } from '../prisma/prisma.service';
import { CreateReleveStockPSLDto } from './dto/create-releve-psl.dto';
export declare class RelevesPslService {
    private prisma;
    constructor(prisma: PrismaService);
    getStockTheoriqueActuel(): Promise<Record<string, number>>;
    findAll(filters?: {
        dateDebut?: string;
        dateFin?: string;
    }): Promise<{
        id: string;
        date: string;
        typeCarburant: string;
        quantiteDeclareePSL: number;
        commentaire: string | null;
        stockTheorique: number;
    }[]>;
    create(dto: CreateReleveStockPSLDto): Promise<{
        id: string;
        date: string;
        typeCarburant: string;
        quantiteDeclareePSL: number;
        commentaire: string | null;
        stockTheorique: number;
    }>;
}
