import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.vehicle.findMany();
  }

  findOne(id: string) {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  async updatePosition(id: string, positionLat: number, positionLng: number) {
    return this.prisma.vehicle.update({
      where: { id },
      data: { positionLat, positionLng },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.vehicle.update({
      where: { id },
      data: { status },
    });
  }
}
