import { DepotsService } from './depots.service';
import { CreateDepotDto } from './dto/create-depot.dto';
export declare class DepotsController {
    private readonly service;
    constructor(service: DepotsService);
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
