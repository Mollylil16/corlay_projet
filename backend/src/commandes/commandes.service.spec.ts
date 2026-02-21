import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CommandesService } from './commandes.service';
import { ValidationTresorerieDto } from './dto/validation-tresorerie.dto';
import { ValidationFacturationDto } from './dto/validation-facturation.dto';

describe('CommandesService', () => {
  let service: CommandesService;
  let prisma: PrismaService;

  const mockPrisma = {
    commande: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CommandesService>(CommandesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('devrait créer une commande avec statut en_attente_tresorerie', async () => {
      const dto = { client: 'Test Client', type: 'Diesel B7', quantite: 1000 };
      mockPrisma.commande.create.mockResolvedValue({
        id: 'CMD-1',
        ...dto,
        statut: 'en_attente_tresorerie',
        date: '2024-01-01',
      });
      const result = await service.create(dto as any);
      expect(mockPrisma.commande.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          client: dto.client,
          type: dto.type,
          quantite: dto.quantite,
          statut: 'en_attente_tresorerie',
        }),
      });
      expect(result.statut).toBe('en_attente_tresorerie');
    });
  });

  describe('validationTresorerie', () => {
    it('devrait rejeter si commande introuvable', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue(null);
      await expect(
        service.validationTresorerie('CMD-999', {
          paiementRecu: true,
          moyenPaiement: 'virement',
        } as ValidationTresorerieDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.commande.update).not.toHaveBeenCalled();
    });

    it('devrait rejeter si statut != en_attente_tresorerie', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue({
        id: 'CMD-1',
        statut: 'validee',
      });
      await expect(
        service.validationTresorerie('CMD-1', {
          paiementRecu: true,
        } as ValidationTresorerieDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.commande.update).not.toHaveBeenCalled();
    });

    it('devrait mettre à jour avec données trésorerie et statut valide_tresorerie', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue({
        id: 'CMD-1',
        statut: 'en_attente_tresorerie',
      });
      mockPrisma.commande.update.mockResolvedValue({
        id: 'CMD-1',
        statut: 'valide_tresorerie',
        paiementRecu: true,
        moyenPaiement: 'virement',
        numeroTransactionVirement: 'TRX-123',
      });
      const dto: ValidationTresorerieDto = {
        paiementRecu: true,
        moyenPaiement: 'virement',
        numeroTransactionVirement: 'TRX-123',
      };
      const result = await service.validationTresorerie('CMD-1', dto);
      expect(mockPrisma.commande.update).toHaveBeenCalledWith({
        where: { id: 'CMD-1' },
        data: expect.objectContaining({
          statut: 'valide_tresorerie',
          paiementRecu: true,
          moyenPaiement: 'virement',
          numeroTransactionVirement: 'TRX-123',
        }),
      });
      expect(result.statut).toBe('valide_tresorerie');
    });
  });

  describe('validationFacturation', () => {
    it('devrait rejeter si commande introuvable', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue(null);
      await expect(
        service.validationFacturation('CMD-999', {
          numeroBonCommandeInterne: 'BC-001',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.commande.update).not.toHaveBeenCalled();
    });

    it('devrait rejeter si statut != valide_tresorerie', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue({
        id: 'CMD-1',
        statut: 'en_attente_tresorerie',
      });
      await expect(
        service.validationFacturation('CMD-1', {
          numeroBonCommandeInterne: 'BC-001',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.commande.update).not.toHaveBeenCalled();
    });

    it('devrait mettre à jour avec numeroBonCommandeInterne et statut validee', async () => {
      mockPrisma.commande.findUnique.mockResolvedValue({
        id: 'CMD-1',
        statut: 'valide_tresorerie',
      });
      mockPrisma.commande.update.mockResolvedValue({
        id: 'CMD-1',
        statut: 'validee',
        numeroBonCommandeInterne: 'BC-INT-2024-001',
      });
      const dto: ValidationFacturationDto = {
        numeroBonCommandeInterne: 'BC-INT-2024-001',
      };
      const result = await service.validationFacturation('CMD-1', dto);
      expect(mockPrisma.commande.update).toHaveBeenCalledWith({
        where: { id: 'CMD-1' },
        data: expect.objectContaining({
          statut: 'validee',
          numeroBonCommandeInterne: 'BC-INT-2024-001',
        }),
      });
      expect(result.statut).toBe('validee');
    });
  });
});
