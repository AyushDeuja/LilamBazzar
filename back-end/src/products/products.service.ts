import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    const user = await this.prisma.user.findUnique({
      where: { id: organization_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.user_role !== 'vendor') {
      throw new ForbiddenException('Only vendors can create products');
    }

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
  async findAll(organization_id: number) {
    return this.prisma.product.findMany({
      where: { organization_id },
      orderBy: { createdAt: 'desc' },
      include: {
        ProductImage: true,
        auction: {
          select: {
            current_price: true,
            end_time: true,
            is_active: true,
          },
        },
        category: { select: { category_name: true } },
        user: { select: { name: true, organization_name: true } },
      },
    });
  }

  // Fetch a single product with images
  async findOne(id: number, organization_id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, organization_id },
      include: {
        ProductImage: true,
        auction: {
          include: {
            bids: {
              orderBy: { bid_amount: 'desc' },
              take: 10,
            },
          },
        },
        category: { select: { category_name: true } },
        user: { select: { name: true, organization_name: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Update a product and its images
  async update(id: number, updateProductDto: UpdateProductDto) {
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
    } = updateProductDto;

    const user = await this.prisma.user.findUnique({
      where: { id: organization_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.user_role !== 'vendor') {
      throw new ForbiddenException('Only vendors can update products');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { auction: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (product.organization_id != organization_id) {
      throw new ForbiddenException('You can only update your own products');
    }

    const productData: any = {
      product_name,
      description: description ?? null,
      stock,
      category_id,
      organization_id,
      is_auction,
      fixed_price: is_auction
        ? null
        : fixed_price
          ? Number(fixed_price)
          : undefined,
      base_price: is_auction ? Number(base_price) : undefined,
      auction_end_time: is_auction ? auction_end_time : null,
      ...rest,
    };

    return this.prisma.$transaction(async (tx) => {
      //updating the main product
      await tx.product.update({
        where: { id },
        data: productData,
      });

      if (
        is_auction &&
        !product.auction &&
        base_price != null &&
        auction_end_time
      ) {
        await tx.auction.create({
          data: {
            product_id: id,
            start_time: new Date(),
            end_time: auction_end_time,
            starting_price: Number(base_price),
            current_price: Number(base_price),
          },
        });
      }

      if (product_img?.length > 0) {
        //delete old images
        await tx.productImage.deleteMany({ where: { product_id: id } });
        const uploadedUrls = await Promise.all(
          product_img.map((img: string) =>
            this.cloudinary.uploadFile(img, 'products'),
          ),
        );
        await tx.productImage.createMany({
          data: uploadedUrls.map((url) => ({
            product_id: id,
            product_img: url,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          ProductImage: { orderBy: { id: 'asc' } },
          auction: {
            include: {
              bids: {
                orderBy: { bid_amount: 'desc' },
                take: 5,
              },
            },
          },
          category: { select: { category_name: true } },
          user: { select: { name: true, organization_name: true } },
        },
      });
    });
  }

  // Delete a product and its images
  async remove(id: number, organization_id: number) {
    await this.findOne(id, organization_id);
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { organization_id: true, auction: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.organization_id !== organization_id)
      throw new ForbiddenException('You can only delete your own products');

    return this.prisma.$transaction(async (tx) => {
      // delete product image first
      await tx.productImage.deleteMany({ where: { product_id: id } });

      // delete the auction if exists
      if (product.auction) {
        await tx.auction.delete({ where: { id: product.auction.id } });
      }

      // delete the product
      return tx.product.delete({
        where: { id },
        include: {
          ProductImage: true,
          auction: true,
        },
      });
    });
  }
}
