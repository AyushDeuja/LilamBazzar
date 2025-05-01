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
    // Create the product first (without images)
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    // Check if multiple base64 images are provided in the DTO
    if (
      createProductDto.product_img &&
      createProductDto.product_img.length > 0
    ) {
      // Upload each base64 image to Cloudinary
      const uploadPromises = createProductDto.product_img.map((image: string) =>
        this.cloudinary.uploadFile(image, 'products'),
      );

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);

      // Save the uploaded image URLs in the ProductImage table
      await this.prisma.productImage.createMany({
        data: uploadedUrls.map((url) => ({
          product_id: product.id,
          product_img: url,
        })),
      });
    }

    return product;
  }

  // Fetch all products along with their associated images
  async findAll() {
    return this.prisma.product.findMany({
      include: { ProductImage: true }, // Include related ProductImage entries
    });
  }

  // Fetch a single product by id along with its associated images
  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { ProductImage: true }, // Include related ProductImage entries
    });
  }

  // Update an existing product, including handling new images
  async update(id: number, updateProductDto: UpdateProductDto) {
    // If new images are provided, upload them and save in ProductImage table
    if (
      updateProductDto.product_img &&
      updateProductDto.product_img.length > 0
    ) {
      const uploadPromises = updateProductDto.product_img.map((image: string) =>
        this.cloudinary.uploadFile(image, 'products'),
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      // Optionally delete old images
      await this.prisma.productImage.deleteMany({ where: { product_id: id } });

      // Save the new uploaded URLs in the ProductImage table
      await this.prisma.productImage.createMany({
        data: uploadedUrls.map((url) => ({
          product_id: id,
          product_img: url,
        })),
      });
    }

    // Update the product's other fields (without changing images)
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // Remove a product and optionally delete its images
  async remove(id: number) {
    // Optionally delete related product images
    await this.prisma.productImage.deleteMany({ where: { product_id: id } });

    // Delete the product itself
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
