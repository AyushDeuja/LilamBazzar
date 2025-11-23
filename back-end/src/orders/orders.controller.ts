import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
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
    createOrderDto.user_id = req.payload.id;
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Req() req: Payload) {
    return this.ordersService.findAll(req.payload.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Payload) {
    return this.ordersService.findOne(+id, req.payload.id);
  }

  // Vendor: My Sales
  @Get('my-sales')
  async getMySales(@Req() req: Payload) {
    return this.ordersService.getMySales(req.payload.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: Payload,
  ) {
    updateOrderDto.user_id = req.payload.id;
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Payload) {
    return this.ordersService.remove(+id, req.payload.id);
  }
}
