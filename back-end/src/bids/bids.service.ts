import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaClient) {}
  async create(createBidDto: CreateBidDto) {
    createBidDto.product_id = 7;
    createBidDto.bidder_id = 3;
    //product_id must be unique
    const existingProduct = await this.prisma.bid.findUnique({
      where: { product_id: createBidDto.product_id },
    });
    if (existingProduct) {
      throw new BadRequestException('Product already exists');
    }

    // bidder_id must be customer not admin or vendor
    const isCustomer = await this.prisma.user.findUnique({
      where: { id: createBidDto.bidder_id },
    });
    if (!isCustomer) {
      throw new BadRequestException('Bidder not found');
    }
    if (isCustomer.user_role !== 'customer') {
      throw new BadRequestException('Bidder must be a customer');
    }

    // bid_price must be greater than base price
    const existingProductBasePrice = await this.prisma.product.findFirst({
      where: { id: createBidDto.product_id },
    });
    if (!existingProductBasePrice) {
      throw new BadRequestException('Product not found');
    }
    if (
      createBidDto.bid_price <= existingProductBasePrice.base_price.toNumber()
    ) {
      throw new BadRequestException(
        'Bid price must be greater than base price',
      );
    }

    return this.prisma.bid.create({
      data: createBidDto,
    });
  }

  async findAll() {
    return this.prisma.bid.findMany();
  }

  async findOne(id: number) {
    return this.prisma.bid.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateBidDto: UpdateBidDto) {
    // const existingProduct = await this.prisma.bid.findUnique({
    //   where: { product_id: updateBidDto.product_id },
    // });
    // if (existingProduct) {
    //   throw new BadRequestException('Product already exists');
    // }

    const isCustomer = await this.prisma.user.findUnique({
      where: { id: updateBidDto.bidder_id },
    });
    if (!isCustomer) {
      throw new BadRequestException('Bidder not found');
    }
    if (isCustomer.user_role !== 'customer') {
      throw new BadRequestException('Bidder must be a customer');
    }

    // bid_price must be greater than base price
    const existingProductBasePrice = await this.prisma.product.findFirst({
      where: { id: updateBidDto.product_id },
    });
    if (!existingProductBasePrice) {
      throw new BadRequestException('Product not found');
    }
    if (
      updateBidDto.bid_price === undefined ||
      updateBidDto.bid_price <= existingProductBasePrice.base_price.toNumber()
    ) {
      throw new BadRequestException(
        'Bid price must be greater than base price',
      );
    }

    return this.prisma.bid.update({
      where: { id },
      data: updateBidDto,
    });
  }

  async remove(id: number) {
    return this.prisma.bid.delete({
      where: { id },
    });
  }
}
