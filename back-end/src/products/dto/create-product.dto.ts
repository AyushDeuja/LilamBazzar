import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @IsOptional()
  @IsString()
  product_img: string;

  @IsNotEmpty()
  @IsDecimal()
  base_price: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNumber()
  category_id: number;

  @IsOptional()
  @IsNumber()
  organization_id: number;
}
