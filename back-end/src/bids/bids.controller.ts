import { Body, Controller, Param, Post, Req, Get } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { Payload } from 'src/interfaces/payload';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post('auction/:id')
  async placeBid(
    @Param('id') id: string,
    @Body() createBidDto: CreateBidDto,
    @Req() req: Payload,
  ) {
    createBidDto.bidder_id = req.payload.id;
    return this.bidsService.placeBid(+id, createBidDto);
  }

  @Get('auction/:auctionId/history')
  async getAuctionBidHistory(@Param('auctionId') auctionId: string) {
    return this.bidsService.getAuctionBidHistory(+auctionId);
  }

  @Get('my-bids')
  async getMyBids(@Req() req: Payload) {
    return this.bidsService.getMyBids(req.payload.id);
  }
}
