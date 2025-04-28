import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaClient) {}
  create(createSaleDto: CreateSaleDto) {
    return this.prisma.sale.create({
      data: createSaleDto,
    });
  }

  findAll() {
    return this.prisma.sale.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} sale`;
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
