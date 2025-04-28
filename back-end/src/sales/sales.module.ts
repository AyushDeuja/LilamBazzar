import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaClient } from 'generated/prisma';

@Module({
  controllers: [SalesController],
  providers: [SalesService, PrismaClient],
})
export class SalesModule {}
