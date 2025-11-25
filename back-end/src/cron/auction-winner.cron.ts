import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuctionWinnerCron {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleEndedAuctions() {
    const endedAuctions = await this.prisma.auction.findMany({
      where: {
        end_time: { lte: new Date() },
        is_active: true,
        winner_id: null,
      },
      include: { bids: { orderBy: { bid_amount: 'desc' }, take: 1 } },
    });

    for (const auction of endedAuctions) {
      if (auction.bids.length > 0) {
        const winningBid = auction.bids[0];
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: {
            winner_id: winningBid.bidder_id,
            is_active: false,
          },
        });
        console.log(
          `Winner declared! Auction ${auction.id} → User ${winningBid.bidder_id}`,
        );
      } else {
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: { is_active: false },
        });
        console.log(`Auction ${auction.id} ended with no bids`);
      }
    }
  }
}
