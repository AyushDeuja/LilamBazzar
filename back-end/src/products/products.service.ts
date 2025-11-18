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
    // createProductDto.category_id = 20;
    // createProductDto.organization_id = 1;

    const {
      product_img = [],
      category_id,
      is_auction = false,
      fixed_price,
      base_price,
      auction_end_time,
      description,
      product_name,
      stock,
      organization_id,
      // organization_id = vendorId,
      ...rest
    } = createProductDto;

    const productData: any = {
      product_name,
      description: description ?? null,
      stock,
      category_id,
      organization_id,
      is_auction,
      fixed_price: is_auction ? null : fixed_price ? Number(fixed_price) : null,
      base_price: is_auction ? Number(base_price) : null,
      auction_end_time: is_auction ? auction_end_time : null,
      ...rest,
    };

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productData,
      });

      if (is_auction && base_price != null && auction_end_time) {
        await tx.auction.create({
          data: {
            product_id: product.id,
            start_time: new Date(),
            end_time: auction_end_time,
            starting_price: Number(base_price),
            current_price: Number(base_price),
          },
        });
      }

      if (product_img?.length > 0) {
        const uploadedUrls = await Promise.all(
          product_img.map((img: string) =>
            this.cloudinary.uploadFile(img, 'products'),
          ),
        );

        await tx.productImage.createMany({
          data: uploadedUrls.map((url) => ({
            product_id: product.id,
            product_img: url,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          ProductImage: { orderBy: { id: 'asc' } },
          auction: {
            include: {
              bids: {
                orderBy: { bid_amount: 'desc' },
                take: 5, // Get the 5 highest bids
              },
            },
          },
          category: { select: { category_name: true } },
          user: { select: { name: true, organization_name: true } },
        },
      });
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
