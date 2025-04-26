import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { PrismaClient } from 'generated/prisma';

@Module({
  controllers: [BidsController],
  providers: [BidsService, PrismaClient],
})
export class BidsModule {}
