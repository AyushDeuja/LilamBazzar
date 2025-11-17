import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Validate each element as a string
  product_img?: string[]; // Array of base64 image strings

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsOptional()
  @IsNumber()
  category_id: number;

  @IsOptional()
  @IsNumber()
  organization_id: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1)
  is_auction?: boolean = false;

  @ValidateIf((o) => !o.is_auction)
  @IsNotEmpty({ message: 'fixed_price is required for regular products' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  fixed_price?: number;

  @ValidateIf((o) => o.is_auction)
  @IsNotEmpty({ message: 'base_price is required for auction products' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  base_price?: number;

  @ValidateIf((o) => o.is_auction)
  @IsNotEmpty({ message: 'auction_end_time is required for auction products' })
  @IsDate()
  @Type(() => Date)
  auction_end_time?: Date;
}
