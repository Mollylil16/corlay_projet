"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const commandes_module_1 = require("./commandes.module");
const prisma_module_1 = require("../prisma/prisma.module");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const mockJwtGuard = { canActivate: () => true };
describe('Commandes API (intégration)', () => {
    let app;
    const mockPrisma = {
        commande: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [commandes_module_1.CommandesModule, prisma_module_1.PrismaModule],
        })
            .overrideProvider(prisma_service_1.PrismaService)
            .useValue(mockPrisma)
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useValue(mockJwtGuard)
            .compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        if (app)
            await app.close();
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /commandes', () => {
        it('devrait retourner la liste des commandes', async () => {
            mockPrisma.commande.findMany.mockResolvedValue([
                { id: 'CMD-1', client: 'Client A', statut: 'en_attente_tresorerie' },
            ]);
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/commandes')
                .expect(common_1.HttpStatus.OK);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].id).toBe('CMD-1');
            expect(mockPrisma.commande.findMany).toHaveBeenCalled();
        });
    });
    describe('PATCH /commandes/:id/validation-tresorerie', () => {
        it('devrait retourner 400 si commande introuvable', async () => {
            mockPrisma.commande.findUnique.mockResolvedValue(null);
            await (0, supertest_1.default)(app.getHttpServer())
                .patch('/commandes/CMD-999/validation-tresorerie')
                .send({ paiementRecu: true })
                .expect(common_1.HttpStatus.BAD_REQUEST);
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
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .patch('/commandes/CMD-1/validation-tresorerie')
                .send({
                paiementRecu: true,
                moyenPaiement: 'virement',
                numeroTransactionVirement: 'TRX-123',
            })
                .expect(common_1.HttpStatus.OK);
            expect(res.body.statut).toBe('valide_tresorerie');
            expect(mockPrisma.commande.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'CMD-1' },
                data: expect.objectContaining({
                    statut: 'valide_tresorerie',
                    paiementRecu: true,
                }),
            }));
        });
    });
    describe('PATCH /commandes/:id/validation-facturation', () => {
        it('devrait retourner 400 si commande introuvable', async () => {
            mockPrisma.commande.findUnique.mockResolvedValue(null);
            await (0, supertest_1.default)(app.getHttpServer())
                .patch('/commandes/CMD-999/validation-facturation')
                .send({ numeroBonCommandeInterne: 'BC-001' })
                .expect(common_1.HttpStatus.BAD_REQUEST);
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
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .patch('/commandes/CMD-1/validation-facturation')
                .send({ numeroBonCommandeInterne: 'BC-INT-001' })
                .expect(common_1.HttpStatus.OK);
            expect(res.body.statut).toBe('validee');
            expect(mockPrisma.commande.update).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=commandes.integration.spec.js.map