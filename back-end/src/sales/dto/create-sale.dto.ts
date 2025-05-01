import { IsDecimal, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateSaleDto {
  @IsOptional()
  @IsNumber()
  user_id: number;

  @IsOptional()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsDecimal()
  total: number;

  @IsNotEmpty()
  @IsDecimal()
  commission: number;

  @IsNotEmpty()
  @IsDecimal()
  tax: number;
}
