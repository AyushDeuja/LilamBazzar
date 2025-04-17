import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { roleType } from 'generated/prisma';

export class CreateRoleDto {
  @IsEnum(roleType)
  @IsNotEmpty()
  role_name: string;
}
