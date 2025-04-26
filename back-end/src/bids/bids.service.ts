import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaClient) {}
  async create(createBidDto: CreateBidDto) {
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
