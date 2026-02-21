import { PrismaService } from '../prisma/prisma.service';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        destination: string;
        driver: string;
        status: string;
        progress: number;
        eta: string | null;
        positionLat: number;
        positionLng: number;
        speed: number;
        route: string | null;
        hasDeviation: boolean;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__VehicleClient<{
        id: string;
        destination: string;
        driver: string;
        status: string;
        progress: number;
        eta: string | null;
        positionLat: number;
        positionLng: number;
        speed: number;
        route: string | null;
        hasDeviation: boolean;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updatePosition(id: string, positionLat: number, positionLng: number): Promise<{
        id: string;
        destination: string;
        driver: string;
        status: string;
        progress: number;
        eta: string | null;
        positionLat: number;
        positionLng: number;
        speed: number;
        route: string | null;
        hasDeviation: boolean;
    }>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        destination: string;
        driver: string;
        status: string;
        progress: number;
        eta: string | null;
        positionLat: number;
        positionLng: number;
        speed: number;
        route: string | null;
        hasDeviation: boolean;
    }>;
}
