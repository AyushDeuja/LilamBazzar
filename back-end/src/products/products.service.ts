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

  // Create a new product with multiple base64 images
  async create(createProductDto: CreateProductDto) {
    createProductDto.category_id = 20;
    createProductDto.organization_id = 1;

    const { product_img = [], ...productData } = createProductDto;

    // Create the product (without images)
    const product = await this.prisma.product.create({
      data: productData,
    });

    // Handle image uploads
    if (product_img?.length > 0) {
      const uploadedUrls = await Promise.all(
        product_img.map((img: string) =>
          this.cloudinary.uploadFile(img, 'products'),
        ),
      );

      await this.prisma.productImage.createMany({
        data: uploadedUrls.map((url) => ({
          product_id: product.id,
          product_img: url,
        })),
      });
    }

    // Return product with images
    return this.prisma.product.findUnique({
      where: { id: product.id },
      include: { ProductImage: true },
    });
  }

  // Fetch all products with images
  async findAll() {
    return this.prisma.product.findMany({
      include: { ProductImage: true },
    });
  }

  // Fetch a single product with images
  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { ProductImage: true },
    });
  }

  // Update a product and its images
  async update(id: number, updateProductDto: UpdateProductDto) {
    const { product_img = [], ...updateData } = updateProductDto;

    // Update the product's fields
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Handle image updates (if any)
    if (product_img?.length > 0) {
      // Delete old images
      await this.prisma.productImage.deleteMany({ where: { product_id: id } });

      // Upload new ones
      const uploadedUrls = await Promise.all(
        product_img.map((img: string) =>
          this.cloudinary.uploadFile(img, 'products'),
        ),
      );

      await this.prisma.productImage.createMany({
        data: uploadedUrls.map((url) => ({
          product_id: id,
          product_img: url,
        })),
      });
    }

    // Return updated product with images
    return this.prisma.product.findUnique({
      where: { id },
      include: { ProductImage: true },
    });
  }

  // Delete a product and its images
  async remove(id: number) {
    // Delete related images first
    await this.prisma.productImage.deleteMany({ where: { product_id: id } });

    // Delete product and return it
    return this.prisma.product.delete({
      where: { id },
      include: { ProductImage: true },
    });
  }
}
