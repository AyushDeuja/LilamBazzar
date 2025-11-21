import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaClient) {}
  async create(createSaleDto: CreateSaleDto) {
    return this.prisma.sale.create({
      data: createSaleDto,
    });
  }

  async findAll(user_id: number) {
    return this.prisma.sale.findMany({
      where: { user_id },
    });
  }

  async findOne(id: number, user_id: number) {
    const sale = this.prisma.sale.findUnique({
      where: { id, user_id },
    });
    if (!sale) {
      throw new NotFoundException('Sales not found');
    }
    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    return this.prisma.sale.update({
      where: { id },
      data: updateSaleDto,
    });
  }

  async remove(id: number, user_id) {
    await this.findOne(id, user_id);
    return this.prisma.sale.delete({
      where: { id },
    });
  }
}
