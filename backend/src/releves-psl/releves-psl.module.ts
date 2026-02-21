import { Module } from '@nestjs/common';
import { RelevesPslController } from './releves-psl.controller';
import { RelevesPslService } from './releves-psl.service';

@Module({
  controllers: [RelevesPslController],
  providers: [RelevesPslService],
  exports: [RelevesPslService],
})
export class RelevesPslModule {}
