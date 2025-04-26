import {
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateBidDto {
  @IsOptional()
  @IsNumber()
  product_id: number;

  @IsOptional()
  @IsNumber()
  bidder_id: number;

  @IsNotEmpty()
  @IsDecimal()
  bid_price: number;

  @IsOptional()
  @IsBoolean()
  is_winner: boolean;
}
