import { Module } from '@nestjs/common';
import { CamionsController } from './camions.controller';
import { CamionsService } from './camions.service';

@Module({
  controllers: [CamionsController],
  providers: [CamionsService],
  exports: [CamionsService],
})
export class CamionsModule {}
