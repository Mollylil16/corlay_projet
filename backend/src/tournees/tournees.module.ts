import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TourneesController } from './tournees.controller';
import { TourneesService } from './tournees.service';

@Module({
  imports: [PrismaModule],
  controllers: [TourneesController],
  providers: [TourneesService],
  exports: [TourneesService],
})
export class TourneesModule {}
