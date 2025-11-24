import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(createOrderDto: CreateOrderDto, user_id: number) {
    const { bid_id, payment_method } = createOrderDto;

    return 'This action adds a new order';
  }

  async getMyOrders(user_id: number) {
    return `This action returns all orders`;
  }

  async findOne(id: number, user_id: number) {
    return `This action returns a #${id} order`;
  }

  async getMySales(vendor_id: number) {
    return `This action returns sales for vendor #${vendor_id}`;
  }

  async updateStatus(id: number, order_status: string) {
    return `This action updates a #${id} order`;
  }

  async cancelOrder(id: number, user_id: number) {
    return `This action removes a #${id} order`;
  }
}
