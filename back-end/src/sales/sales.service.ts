import { Injectable } from '@nestjs/common';
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

  async findAll() {
    return this.prisma.sale.findMany();
  }

  async findOne(id: number) {
    return this.prisma.sale.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    return this.prisma.sale.update({
      where: { id },
      data: updateSaleDto,
    });
  }

  async remove(id: number) {
    return this.prisma.sale.delete({
      where: { id },
    });
  }
}
