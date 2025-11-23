import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaClient],
})
export class OrdersModule {}
