import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaClient } from 'generated/prisma';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaClient],
})
export class CategoriesModule {}
