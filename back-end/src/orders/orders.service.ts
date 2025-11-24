import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(createOrderDto: CreateOrderDto, user_id: number) {
    const { bid_id, items, payment_method } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      let total = Prisma.Decimal(0);
      const orderItemsData: Array<{
        product_id: number;
        quantity: number;
        unit_price: Prisma.Decimal;
        total_price: Prisma.Decimal;
      }> = [];

      if (bid_id) {
        const bid = await tx.bid.findUnique({
          where: { id: bid_id },
          include: { auction: true },
        });

        if (!bid || bid.bidder_id !== user_id)
          throw new BadRequestException('Invalid Bid');

        if (bid.auction.winner_id !== user_id)
          throw new BadRequestException('You did not win this auction');
      }

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.product_id },
          include: { auction: true },
        });

        if (!product)
          throw new NotFoundException(`Product not found: ${item.product_id}`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${product.product_name}`,
          );
        }

        let price: Prisma.Decimal;

        if (bid_id && product.is_auction) {
          const winningBid = await tx.bid.findFirst({
            where: { auction_id: product.auction?.id, bidder_id: user_id },
            orderBy: { bid_amount: 'desc' },
          });
          price = winningBid!.bid_amount;
        } else {
          if (!product.fixed_price) {
            throw new BadRequestException('Product has no price');
          }
          price = product.fixed_price;
        }

        const itemTotal = price.mul(item.quantity);
        total = total.add(itemTotal);

        orderItemsData.push({
          product_id: product.id,
          quantity: item.quantity,
          unit_price: price,
          total_price: itemTotal,
        });
      }

      const order = await tx.order.create({
        data: {
          order_no: `LILAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id,
          bid_id,
          total_amount: total,
          payment_method: payment_method || null,
          payment_status:
            payment_method && payment_method !== 'cod' ? 'pending' : 'paid',
          order_status: 'pending',
          is_delivered: false,
          OrderHasItem: {
            create: orderItemsData,
          },
        },
        include: {
          OrderHasItem: {
            include: {
              product: {
                include: { ProductImage: { take: 1 } },
              },
            },
          },
          user: { select: { name: true, mobile: true } },
          bid: { include: { auction: { include: { product: true } } } },
        },
      });

      return {
        success: true,
        order,
        message: 'Order Created Successfully',
      };
    });
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
