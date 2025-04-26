export class CreateBidDto {
  product_id: string;
  bidder_id: string;
  bid_price: number;
  is_winner: boolean;
}
