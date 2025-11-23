import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  async create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findAll(user_id: number) {
    return `This action returns all orders`;
  }

  async findOne(id: number, user_id: number) {
    return `This action returns a #${id} order`;
  }

  async getMySales(vendor_id: number) {
    return `This action returns sales for vendor #${vendor_id}`;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async remove(id: number, user_id: number) {
    return `This action removes a #${id} order`;
  }
}
