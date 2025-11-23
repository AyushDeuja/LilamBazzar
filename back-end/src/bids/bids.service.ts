import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBidDto } from './dto/create-bid.dto';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaClient) {}

  async placeBid(id: number, createBidDto: CreateBidDto) {
    const { bidder_id, bid_amount, auction_id, ...rest } = createBidDto;

    if (bid_amount < 0)
      throw new BadRequestException('Bid amount must be positive');

    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id },
        select: {
          id: true,
          is_active: true,
          start_time: true,
          end_time: true,
          current_price: true,
          starting_price: true,
          min_increment: true,
          product: {
            select: {
              product_name: true,
              organization_id: true,
              is_auction: true,
              auction_start_time: true,
              auction_end_time: true,
            },
          },
        },
      });

      if (!auction) throw new NotFoundException('Auction not found');
      if (!auction.product.is_auction)
        throw new BadRequestException('This is not an auction product');
      if (!auction.is_active)
        throw new BadRequestException('Auction is no longer active');

      const presentDate = new Date();

      if (presentDate < auction.start_time)
        throw new BadRequestException(
          `Auction starts in ${auction.start_time.toLocaleString()}`,
        );

      if (presentDate >= auction.end_time)
        throw new BadRequestException(`Auction has ended`);

      const currentHighest = auction.current_price || auction.starting_price;
      const minNextBid = Number(currentHighest) + Number(auction.min_increment);
      if (bid_amount < minNextBid) {
        throw new BadRequestException(`Bid must be at least Rs.${minNextBid}`);
      }

      if (bidder_id === auction.product.organization_id) {
        throw new ForbiddenException('You cannot bid on your own product');
      }

      const bid = await tx.bid.create({
        data: {
          bidder_id,
          auction_id: id,
          bid_amount,
        },
      });

      await tx.auction.update({
        where: { id },
        data: { current_price: bid_amount },
      });

      return {
        success: true,
        bid,
        new_current_price: bid_amount,
        message: 'Bid placed successfully!',
      };
    });
  }

  async getAuctionBidHistory(id: number) {
    return this.prisma.bid.findMany({
      where: { auction_id: id },
      orderBy: { createdAt: 'desc' },
      include: { bidder: { select: { name: true } } },
    });
  }

  async getMyBids(bidder_id: number) {
    return this.prisma.bid.findMany({
      where: { bidder_id },
      orderBy: { createdAt: 'desc' },
      include: {
        auction: {
          include: {
            product: {
              select: { product_name: true, ProductImage: { take: 1 } },
            },
          },
        },
      },
    });
  }
}
