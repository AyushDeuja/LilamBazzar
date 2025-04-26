import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaClient) {}
  async create(createBidDto: CreateBidDto) {
    //product_id must be unique
    const existingProduct = await this.prisma.bid.findUnique({
      where: { product_id: createBidDto.product_id },
    });
    if (existingProduct) {
      throw new BadRequestException('Product already exists');
    }

    // bidder_id must be customer not admin or vendor
    const existingCusotmer = await this.prisma.user.findUnique({
      where: { id: createBidDto.bidder_id },
    });
    if (!existingCusotmer) {
      throw new BadRequestException('Bidder not found');
    }
    if (existingCusotmer.user_role !== 'customer') {
      throw new BadRequestException('Bidder must be a customer');
    }

    //bidder_id must be unique
    const existingBidder = await this.prisma.bid.findUnique({
      where: { bidder_id: createBidDto.bidder_id },
    });
    if (existingBidder) {
      throw new BadRequestException('Bidder already exists');
    }

    //bid_price must be greater than 0
    if (createBidDto.bid_price <= 0) {
      throw new BadRequestException('Bid price must be greater than 0');
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
    const existingProduct = await this.prisma.bid.findUnique({
      where: { product_id: updateBidDto.product_id },
    });
    if (existingProduct) {
      throw new BadRequestException('Product already exists');
    }

    const existingCusotmer = await this.prisma.user.findUnique({
      where: { id: updateBidDto.bidder_id },
    });
    if (!existingCusotmer) {
      throw new BadRequestException('Bidder not found');
    }
    if (existingCusotmer.user_role !== 'customer') {
      throw new BadRequestException('Bidder must be a customer');
    }

    const existingBidder = await this.prisma.bid.findUnique({
      where: { bidder_id: updateBidDto.bidder_id },
    });
    if (existingBidder) {
      throw new BadRequestException('Bidder already exists');
    }

    if (updateBidDto.bid_price === undefined || updateBidDto.bid_price <= 0) {
      throw new BadRequestException('Bid price must be greater than 0');
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
