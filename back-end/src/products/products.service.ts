import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cloudinary: CloudinaryService,
  ) {}
  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    // createProductDto.category_id = 1;
    // createProductDto.organization_id = 1;
    if (file) {
      const uploadedUrl = await this.cloudinary.uploadFile(file, 'products');
      createProductDto.product_img = uploadedUrl;
    }

    return this.prisma.product.create({
      data: createProductDto,
    });
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
