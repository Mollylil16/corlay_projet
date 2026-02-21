"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourneesModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const tournees_controller_1 = require("./tournees.controller");
const tournees_service_1 = require("./tournees.service");
let TourneesModule = class TourneesModule {
};
exports.TourneesModule = TourneesModule;
exports.TourneesModule = TourneesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [tournees_controller_1.TourneesController],
        providers: [tournees_service_1.TourneesService],
        exports: [tournees_service_1.TourneesService],
    })
], TourneesModule);
//# sourceMappingURL=tournees.module.js.map