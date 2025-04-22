import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { roleType } from 'generated/prisma';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(15)
  mobile: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(roleType)
  @IsOptional()
  user_role: roleType;

  //these are only for vendors
  @IsString()
  @IsOptional()
  organization_name: string;

  @IsString()
  @IsOptional()
  pan_no: string;
}
