import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.alerte.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  findOne(id: string) {
    return this.prisma.alerte.findUnique({ where: { id } });
  }

  markAsRead(id: string) {
    return this.prisma.alerte.update({
      where: { id },
      data: { lu: true },
    });
  }

  async create(dto: { type: string; severite: string; titre: string; message: string; vehicule?: string; depot?: string; lu?: boolean }) {
    const id = `alert-${Date.now()}`;
    return this.prisma.alerte.create({
      data: {
        id,
        type: dto.type,
        severite: dto.severite,
        titre: dto.titre,
        message: dto.message,
        vehicule: dto.vehicule ?? null,
        depot: dto.depot ?? null,
        timestamp: new Date().toISOString(),
        lu: dto.lu ?? false,
      },
    });
  }
}
