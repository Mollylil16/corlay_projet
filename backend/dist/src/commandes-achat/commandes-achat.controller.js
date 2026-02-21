"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandesAchatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const commandes_achat_service_1 = require("./commandes-achat.service");
const create_commande_achat_dto_1 = require("./dto/create-commande-achat.dto");
let CommandesAchatController = class CommandesAchatController {
    constructor(service) {
        this.service = service;
    }
    findAll(dateDebut, dateFin) {
        return this.service.findAll({ dateDebut, dateFin });
    }
    create(dto) {
        return this.service.create(dto);
    }
};
exports.CommandesAchatController = CommandesAchatController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommandesAchatController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_commande_achat_dto_1.CreateCommandeAchatDto]),
    __metadata("design:returntype", void 0)
], CommandesAchatController.prototype, "create", null);
exports.CommandesAchatController = CommandesAchatController = __decorate([
    (0, common_1.Controller)('commandes-achat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [commandes_achat_service_1.CommandesAchatService])
], CommandesAchatController);
//# sourceMappingURL=commandes-achat.controller.js.map