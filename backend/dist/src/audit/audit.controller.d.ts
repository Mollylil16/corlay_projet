import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditController {
    private readonly service;
    constructor(service: AuditService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        timestamp: string;
        description: string;
        userId: string;
        userName: string;
        action: string;
        entity: string;
        entityId: string;
    }[]>;
    create(dto: CreateAuditLogDto): Promise<{
        id: string;
        timestamp: string;
        description: string;
        userId: string;
        userName: string;
        action: string;
        entity: string;
        entityId: string;
    }>;
}
