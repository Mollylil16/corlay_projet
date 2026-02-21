import { PrismaService } from '../prisma/prisma.service';
import { CreateDepotDto } from './dto/create-depot.dto';
export declare class DepotsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        tanks: {
            id: string;
            name: string;
            type: string;
            tankNumber: string;
            capacity: number;
            percentage: number;
            current: number;
            depotId: string;
        }[];
    } & {
        id: string;
        nom: string;
        statut: string;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__DepotClient<({
        tanks: {
            id: string;
            name: string;
            type: string;
            tankNumber: string;
            capacity: number;
            percentage: number;
            current: number;
            depotId: string;
        }[];
    } & {
        id: string;
        nom: string;
        statut: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(dto: CreateDepotDto): Promise<({
        tanks: {
            id: string;
            name: string;
            type: string;
            tankNumber: string;
            capacity: number;
            percentage: number;
            current: number;
            depotId: string;
        }[];
    } & {
        id: string;
        nom: string;
        statut: string;
    }) | null>;
    adjustStock(depotId: string, tankId: string, percentage: number): Promise<{
        id: string;
        name: string;
        type: string;
        tankNumber: string;
        capacity: number;
        percentage: number;
        current: number;
        depotId: string;
    } | null>;
}
