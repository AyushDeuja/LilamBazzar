import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaClient } from 'generated/prisma';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaClient],
})
export class ProductsModule {}
