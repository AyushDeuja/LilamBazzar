import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateBidDto {
  @IsOptional()
  @IsNumber()
  auction_id: number;

  @IsOptional()
  @IsNumber()
  bidder_id: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1, { message: 'Bid amount must be greater than 0' })
  @Type(() => Number)
  bid_amount: number;
}
