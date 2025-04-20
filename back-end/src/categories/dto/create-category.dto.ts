import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  category_name: string;

  @IsOptional()
  @IsString()
  description: string;
}
