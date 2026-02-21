"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const prisma_service_1 = require("../prisma/prisma.service");
const commandes_service_1 = require("./commandes.service");
describe('CommandesService', () => {
    let service;
    let prisma;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                commandes_service_1.CommandesService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get(commandes_service_1.CommandesService);
        prisma = module.get(prisma_service_1.PrismaService);
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
            const result = await service.create(dto);
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
            await expect(service.validationTresorerie('CMD-999', {
                paiementRecu: true,
                moyenPaiement: 'virement',
            })).rejects.toThrow(common_1.BadRequestException);
            expect(mockPrisma.commande.update).not.toHaveBeenCalled();
        });
        it('devrait rejeter si statut != en_attente_tresorerie', async () => {
            mockPrisma.commande.findUnique.mockResolvedValue({
                id: 'CMD-1',
                statut: 'validee',
            });
            await expect(service.validationTresorerie('CMD-1', {
                paiementRecu: true,
            })).rejects.toThrow(common_1.BadRequestException);
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
            const dto = {
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
            await expect(service.validationFacturation('CMD-999', {
                numeroBonCommandeInterne: 'BC-001',
            })).rejects.toThrow(common_1.BadRequestException);
            expect(mockPrisma.commande.update).not.toHaveBeenCalled();
        });
        it('devrait rejeter si statut != valide_tresorerie', async () => {
            mockPrisma.commande.findUnique.mockResolvedValue({
                id: 'CMD-1',
                statut: 'en_attente_tresorerie',
            });
            await expect(service.validationFacturation('CMD-1', {
                numeroBonCommandeInterne: 'BC-001',
            })).rejects.toThrow(common_1.BadRequestException);
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
            const dto = {
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
//# sourceMappingURL=commandes.service.spec.js.map