import { Module } from '@nestjs/common';
import { CommandesAchatController } from './commandes-achat.controller';
import { CommandesAchatService } from './commandes-achat.service';

@Module({
  controllers: [CommandesAchatController],
  providers: [CommandesAchatService],
  exports: [CommandesAchatService],
})
export class CommandesAchatModule {}
