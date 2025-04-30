import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cloudinary: CloudinaryService,
  ) {}
  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    // save the product image to the database
    if (createProductDto.product_img) {
      const uploadedUrl = await this.cloudinary.uploadFile(file, 'products');
      await this.prisma.productImage.create({
        data: {
          product_id: product.id,
          product_img: uploadedUrl,
        },
      });
    }
  }

  async findAll() {
    return this.prisma.product.findMany({ include: { ProductImage: true } });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
