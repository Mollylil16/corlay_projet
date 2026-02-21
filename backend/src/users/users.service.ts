import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        telephone: true,
        actif: true,
        dateCreation: true,
        derniereConnexion: true,
      },
    });
  }

  async updateDerniereConnexion(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { derniereConnexion: new Date().toISOString() },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        telephone: true,
        actif: true,
        dateCreation: true,
        derniereConnexion: true,
      },
      orderBy: { dateCreation: 'desc' },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Un utilisateur avec cet email existe déjà');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const id = `user-${Date.now()}`;
    const dateCreation = new Date().toISOString().split('T')[0];
    return this.prisma.user.create({
      data: {
        id,
        email: dto.email,
        passwordHash,
        nom: dto.nom,
        prenom: dto.prenom,
        role: dto.role,
        telephone: dto.telephone ?? null,
        actif: true,
        dateCreation,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        telephone: true,
        actif: true,
        dateCreation: true,
        derniereConnexion: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        telephone: true,
        actif: true,
        dateCreation: true,
        derniereConnexion: true,
      },
    });
  }
}
