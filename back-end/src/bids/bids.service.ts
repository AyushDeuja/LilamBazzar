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
    return this.prisma.bid.findMany();
  }

  findOne(id: number) {
    return this.prisma.bid.findUnique({
      where: { id },
    });
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
