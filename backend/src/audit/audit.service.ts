import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 500,
    });
  }

  async create(dto: {
    userId: string;
    userName: string;
    action: string;
    entity: string;
    entityId: string;
    description: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...dto,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
