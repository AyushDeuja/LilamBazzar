import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  user_id: number;

  @IsString()
  @IsNotEmpty({ message: 'order_no is required' })
  order_no: string;

  @IsOptional()
  @IsNumber()
  bid_id: number;

  @IsNotEmpty({ message: 'total_amount is required' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  total_amount: number;

  @IsEnum(['khalti', 'esewa'])
  @IsOptional()
  payment_method: string;

  @IsEnum(['pending', 'paid', 'failed'])
  @IsNotEmpty({ message: 'payment_status is required' })
  payment_status: string = 'pending';

  @IsEnum(['pending', 'confirmed', 'shipped', 'delivered'])
  @IsNotEmpty({ message: 'order_status is required' })
  order_status: string = 'pending';

  @IsOptional()
  @IsString()
  transaction_id: string;

  @IsNotEmpty({ message: 'is_delivered is required' })
  @IsBoolean()
  is_delivered: boolean = false;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  delivered_at: Date;
}

export class OrderItemDto {
  @IsOptional()
  @IsNumber()
  prdouct_id: number;

  @IsNotEmpty({ message: 'quantity is required' })
  @IsNumber()
  quantity: number;

  @IsNotEmpty({ message: 'unit_price is required' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  unit_price: number;

  @IsNotEmpty({ message: 'total_price is required' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  total_price: number;
}
