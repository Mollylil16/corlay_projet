import { Module } from '@nestjs/common';
import { BonsLivraisonController } from './bons-livraison.controller';
import { BonsLivraisonService } from './bons-livraison.service';

@Module({
  controllers: [BonsLivraisonController],
  providers: [BonsLivraisonService],
  exports: [BonsLivraisonService],
})
export class BonsLivraisonModule {}
