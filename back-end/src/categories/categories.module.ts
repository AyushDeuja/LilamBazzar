import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaClient, CloudinaryService],
})
export class CategoriesModule {}
