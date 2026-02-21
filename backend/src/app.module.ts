import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommandesModule } from './commandes/commandes.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DepotsModule } from './depots/depots.module';
import { TransporteursModule } from './transporteurs/transporteurs.module';
import { CamionsModule } from './camions/camions.module';
import { BonsLivraisonModule } from './bons-livraison/bons-livraison.module';
import { AlertesModule } from './alertes/alertes.module';
import { IncidentsModule } from './incidents/incidents.module';
import { AuditModule } from './audit/audit.module';
import { PlansModule } from './plans/plans.module';
import { TourneesModule } from './tournees/tournees.module';
import { RelevesPslModule } from './releves-psl/releves-psl.module';
import { CommandesAchatModule } from './commandes-achat/commandes-achat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CommandesModule,
    VehiclesModule,
    DepotsModule,
    TransporteursModule,
    CamionsModule,
    BonsLivraisonModule,
    AlertesModule,
    IncidentsModule,
    AuditModule,
    PlansModule,
    TourneesModule,
    RelevesPslModule,
    CommandesAchatModule,
  ],
})
export class AppModule {}
