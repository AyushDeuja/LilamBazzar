import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Payload } from 'src/interfaces/payload';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Payload) {
    return this.ordersService.create(createOrderDto, req.payload.id);
  }

  //customers order only
  @Get('my-orders')
  getMyOrders(@Req() req: Payload) {
    return this.ordersService.getMyOrders(req.payload.id);
  }

  // Vendor: My Sales
  @Get('my-sales')
  async getMySales(@Req() req: Payload) {
    return this.ordersService.getMySales(req.payload.id);
  }

  //SINGLE ORDER (Only owner can view)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Payload) {
    return this.ordersService.findOne(+id, req.payload.id);
  }

  // ADMIN ONLY: Update order status (shipped, delivered, etc.)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('order_status') order_status: string,
    @Req() req: Payload,
  ) {
    if (req.payload.user_role !== 'admin') {
      throw new ForbiddenException('Only admin can update order status');
    }
    return this.ordersService.updateStatus(+id, order_status);
  }

  // CANCEL ORDER (Only if not shipped)
  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Req() req: Payload) {
    return this.ordersService.cancelOrder(+id, req.payload.id);
  }
}
