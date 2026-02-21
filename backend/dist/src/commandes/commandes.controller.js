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
exports.CommandesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const commandes_service_1 = require("./commandes.service");
const create_commande_dto_1 = require("./dto/create-commande.dto");
const update_commande_dto_1 = require("./dto/update-commande.dto");
const validation_tresorerie_dto_1 = require("./dto/validation-tresorerie.dto");
const validation_facturation_dto_1 = require("./dto/validation-facturation.dto");
let CommandesController = class CommandesController {
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    updateStatut(id, statut) {
        return this.service.updateStatut(id, statut);
    }
    validationTresorerie(id, dto) {
        return this.service.validationTresorerie(id, dto);
    }
    validationFacturation(id, dto) {
        return this.service.validationFacturation(id, dto);
    }
};
exports.CommandesController = CommandesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_commande_dto_1.CreateCommandeDto]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_commande_dto_1.UpdateCommandeDto]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/statut'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "updateStatut", null);
__decorate([
    (0, common_1.Patch)(':id/validation-tresorerie'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, validation_tresorerie_dto_1.ValidationTresorerieDto]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "validationTresorerie", null);
__decorate([
    (0, common_1.Patch)(':id/validation-facturation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, validation_facturation_dto_1.ValidationFacturationDto]),
    __metadata("design:returntype", void 0)
], CommandesController.prototype, "validationFacturation", null);
exports.CommandesController = CommandesController = __decorate([
    (0, common_1.Controller)('commandes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [commandes_service_1.CommandesService])
], CommandesController);
//# sourceMappingURL=commandes.controller.js.map