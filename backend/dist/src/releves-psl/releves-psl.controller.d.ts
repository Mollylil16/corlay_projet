import { RelevesPslService } from './releves-psl.service';
import { CreateReleveStockPSLDto } from './dto/create-releve-psl.dto';
export declare class RelevesPslController {
    private readonly service;
    constructor(service: RelevesPslService);
    getStockTheoriqueActuel(): Promise<Record<string, number>>;
    findAll(dateDebut?: string, dateFin?: string): Promise<{
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
