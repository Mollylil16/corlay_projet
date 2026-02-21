"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelevesPslModule = void 0;
const common_1 = require("@nestjs/common");
const releves_psl_controller_1 = require("./releves-psl.controller");
const releves_psl_service_1 = require("./releves-psl.service");
let RelevesPslModule = class RelevesPslModule {
};
exports.RelevesPslModule = RelevesPslModule;
exports.RelevesPslModule = RelevesPslModule = __decorate([
    (0, common_1.Module)({
        controllers: [releves_psl_controller_1.RelevesPslController],
        providers: [releves_psl_service_1.RelevesPslService],
        exports: [releves_psl_service_1.RelevesPslService],
    })
], RelevesPslModule);
//# sourceMappingURL=releves-psl.module.js.map