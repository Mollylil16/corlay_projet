import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepotDto } from './dto/create-depot.dto';

@Injectable()
export class DepotsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.depot.findMany({
      include: { tanks: true },
      orderBy: { nom: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.depot.findUnique({
      where: { id },
      include: { tanks: true },
    });
  }

  async create(dto: CreateDepotDto) {
    const id = `depot-${Date.now()}`;
    const statut = dto.statut ?? 'operationnel';
    const depot = await this.prisma.depot.create({
      data: {
        id,
        nom: dto.nom,
        statut,
      },
    });
    if (dto.tanks && dto.tanks.length > 0) {
      for (let i = 0; i < dto.tanks.length; i++) {
        const t = dto.tanks[i];
        const tankId = `tank-${id}-${i + 1}`;
        const pct = Math.min(100, Math.max(0, t.percentage ?? 0));
        const current = Math.round((pct / 100) * t.capacity);
        await this.prisma.tank.create({
          data: {
            id: tankId,
            depotId: depot.id,
            tankNumber: t.tankNumber,
            name: t.name,
            type: t.type,
            capacity: t.capacity,
            percentage: pct,
            current,
          },
        });
      }
    }
    return this.prisma.depot.findUnique({
      where: { id: depot.id },
      include: { tanks: true },
    });
  }

  async adjustStock(depotId: string, tankId: string, percentage: number) {
    const tank = await this.prisma.tank.findFirst({
      where: { id: tankId, depotId },
    });
    if (!tank) return null;
    const current = Math.round((percentage / 100) * tank.capacity);
    return this.prisma.tank.update({
      where: { id: tankId },
      data: { percentage, current },
    });
  }
}
