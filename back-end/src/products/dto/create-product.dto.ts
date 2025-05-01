import {
  IsArray,
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
  @IsArray()
  @IsString() // Validate each element as a string
  product_imgs: string[]; // Array of base64 image strings

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
