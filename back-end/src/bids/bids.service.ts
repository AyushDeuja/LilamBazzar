import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaClient) {}
  create(createBidDto: CreateBidDto) {
    return this.prisma.bid.create({
      data: createBidDto,
    });
  }

  findAll() {
    return `This action returns all bids`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
