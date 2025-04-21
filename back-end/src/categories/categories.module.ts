import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaClient } from 'generated/prisma';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaClient, CloudinaryService],
})
export class CategoriesModule {}
