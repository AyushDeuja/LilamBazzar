import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, User } from 'generated/prisma';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(createUserDto: CreateUserDto) {
    // Check if the user already exists by email or mobile
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { mobile: createUserDto.mobile }],
      },
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new BadRequestException('This email is already in use');
      }
      if (existingUser.mobile === createUserDto.mobile) {
        throw new BadRequestException('This mobile number is already in use');
      }
    }

    // Check if the user role is valid
    const role = createUserDto.user_role ?? 'customer'; // default role

    if (role === 'vendor') {
      if (!createUserDto.organization_name) {
        throw new BadRequestException('Vendors must have organization name');
      } else if (!createUserDto.pan_no) {
        throw new BadRequestException('Vendors must have PAN number');
      }
    } else {
      // For customer or admin: pan_no and organization_name should not be provided
      if (createUserDto.organization_name) {
        throw new BadRequestException(`${role} cannot have organization name`);
      } else if (createUserDto.pan_no) {
        throw new BadRequestException(`${role} cannot have PAN number`);
      }
    }

    // Hash password here using bcrypt
    createUserDto.password = await hash(createUserDto.password, 10);

    const createdUser = await this.prisma.user.create({
      data: createUserDto,
    });
    //to exclude password from the response
    const { password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  async findAll() {
    // Fetch all users from the database excluding the password field
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...rest }) => rest); //destructuring to exclude password
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword; // Return user data without password
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Ensure user exists

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: updateUserDto.email }, { mobile: updateUserDto.mobile }],
      },
    });

    if (existingUser && existingUser.id !== id) {
      if (existingUser.email === updateUserDto.email) {
        throw new BadRequestException('This email is already taken');
      }
      if (existingUser.mobile === updateUserDto.mobile) {
        throw new BadRequestException('This mobile number is already taken');
      }
    }

    // Check if the user role is valid
    const role = updateUserDto.user_role ?? 'customer';
    if (role === 'vendor') {
      if (!updateUserDto.organization_name || !updateUserDto.pan_no) {
        throw new BadRequestException(
          'Vendors must have organization name and PAN number',
        );
      }
    } else {
      if (updateUserDto.organization_name || updateUserDto.pan_no) {
        throw new BadRequestException(
          `${role} cannot have organization name or PAN number`,
        );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: number) {
    await this.findOne(id); // Check if user exists
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
