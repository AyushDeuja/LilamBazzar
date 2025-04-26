import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaClient) {}
  async create(createBidDto: CreateBidDto) {
    //product_id must be unique
    const existingBid = await this.prisma.bid.findUnique({
      where: { product_id: createBidDto.product_id },
    });

    // bidder_id must be customer not admin or vendor
    const existingCusotmer = await this.prisma.user.findUnique({
      where: { id: createBidDto.bidder_id },
    });
    if (!existingCusotmer) {
      throw new Error('Bidder not found');
    }
    if (existingCusotmer.user_role !== 'customer') {
      throw new Error('Bidder must be a customer');
    }

    //bidder_id must be unique
    const existingBidder = await this.prisma.bid.findFirst({
      where: { bidder_id: createBidDto.bidder_id },
    });
    if (existingBidder) {
      throw new Error('Bidder already exists');
    }

    //bid_price must be greater than 0
    if (createBidDto.bid_price <= 0) {
      throw new Error('Bid price must be greater than 0');
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
