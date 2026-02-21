import { CanActivate, ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CommandesModule } from './commandes.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const mockJwtGuard: CanActivate = { canActivate: () => true };

describe('Commandes API (intégration)', () => {
  let app: INestApplication;

  const mockPrisma = {
    commande: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommandesModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /commandes', () => {
    it('devrait retourner la liste des commandes', async () => {
      mockPrisma.commande.findMany.mockResolvedValue([
        { id: 'CMD-1', client: 'Client A', statut: 'en_attente_tresorerie' },
      ]);
      const res = await request(app.getHttpServer())
        .get('/commandes')
        .expect(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe('CMD-1');
      expect(mockPrisma.commande.findMany).toHaveBeenCalled();
    });
  });

  describe('PATCH /commandes/:id/validation-tresorerie', () => {
    it('devrait retourner 400 si commande introuvable', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue(null);
      await request(app.getHttpServer())
        .patch('/commandes/CMD-999/validation-tresorerie')
        .send({ paiementRecu: true })
        .expect(HttpStatus.BAD_REQUEST);
      expect(mockPrisma.commande.update).not.toHaveBeenCalled();
    });

    it('devrait valider la trésorerie et retourner 200', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue({
        id: 'CMD-1',
        statut: 'en_attente_tresorerie',
      });
      mockPrisma.commande.update.mockResolvedValue({
        id: 'CMD-1',
        statut: 'valide_tresorerie',
        paiementRecu: true,
        moyenPaiement: 'virement',
      });
      const res = await request(app.getHttpServer())
        .patch('/commandes/CMD-1/validation-tresorerie')
        .send({
          paiementRecu: true,
          moyenPaiement: 'virement',
          numeroTransactionVirement: 'TRX-123',
        })
        .expect(HttpStatus.OK);
      expect(res.body.statut).toBe('valide_tresorerie');
      expect(mockPrisma.commande.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'CMD-1' },
          data: expect.objectContaining({
            statut: 'valide_tresorerie',
            paiementRecu: true,
          }),
        }),
      );
    });
  });

  describe('PATCH /commandes/:id/validation-facturation', () => {
    it('devrait retourner 400 si commande introuvable', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue(null);
      await request(app.getHttpServer())
        .patch('/commandes/CMD-999/validation-facturation')
        .send({ numeroBonCommandeInterne: 'BC-001' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('devrait valider la facturation et retourner 200', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue({
        id: 'CMD-1',
        statut: 'valide_tresorerie',
      });
      mockPrisma.commande.update.mockResolvedValue({
        id: 'CMD-1',
        statut: 'validee',
        numeroBonCommandeInterne: 'BC-INT-001',
      });
      const res = await request(app.getHttpServer())
        .patch('/commandes/CMD-1/validation-facturation')
        .send({ numeroBonCommandeInterne: 'BC-INT-001' })
        .expect(HttpStatus.OK);
      expect(res.body.statut).toBe('validee');
      expect(mockPrisma.commande.update).toHaveBeenCalled();
    });
  });
});
