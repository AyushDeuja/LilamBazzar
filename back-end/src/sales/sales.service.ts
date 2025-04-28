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
    return this.prisma.sale.findUnique({
      where: { id },
    });
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return this.prisma.sale.update({
      where: { id },
      data: updateSaleDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
