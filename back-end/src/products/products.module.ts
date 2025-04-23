import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaClient } from 'generated/prisma';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaClient, CloudinaryService],
})
export class ProductsModule {}
