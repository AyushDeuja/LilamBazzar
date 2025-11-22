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

  @Get('auction/:id/history')
  async getBidHistory(@Param('id') id: string, @Req() req: Payload) {
    return this.bidsService.getBidHistory(+id, req.payload.id);
  }
}
