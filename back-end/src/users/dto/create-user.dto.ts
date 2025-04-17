import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { roleType } from 'generated/prisma';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
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
