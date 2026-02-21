"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const commandes_module_1 = require("./commandes/commandes.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const depots_module_1 = require("./depots/depots.module");
const transporteurs_module_1 = require("./transporteurs/transporteurs.module");
const camions_module_1 = require("./camions/camions.module");
const bons_livraison_module_1 = require("./bons-livraison/bons-livraison.module");
const alertes_module_1 = require("./alertes/alertes.module");
const incidents_module_1 = require("./incidents/incidents.module");
const audit_module_1 = require("./audit/audit.module");
const plans_module_1 = require("./plans/plans.module");
const tournees_module_1 = require("./tournees/tournees.module");
const releves_psl_module_1 = require("./releves-psl/releves-psl.module");
const commandes_achat_module_1 = require("./commandes-achat/commandes-achat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            commandes_module_1.CommandesModule,
            vehicles_module_1.VehiclesModule,
            depots_module_1.DepotsModule,
            transporteurs_module_1.TransporteursModule,
            camions_module_1.CamionsModule,
            bons_livraison_module_1.BonsLivraisonModule,
            alertes_module_1.AlertesModule,
            incidents_module_1.IncidentsModule,
            audit_module_1.AuditModule,
            plans_module_1.PlansModule,
            tournees_module_1.TourneesModule,
            releves_psl_module_1.RelevesPslModule,
            commandes_achat_module_1.CommandesAchatModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map