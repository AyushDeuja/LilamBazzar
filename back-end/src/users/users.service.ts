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
    let user = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new BadRequestException('This email is already in use');
    }
    user = await this.prisma.user.findUnique({
      where: { mobile: createUserDto.mobile },
    });
    if (user) {
      throw new BadRequestException('This mobile number is already in use');
    }

    // Hash password here using bcrypt
    createUserDto.password = await hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let user: User | null;
    await this.findOne(id); // Check if user exists

    if (updateUserDto.email) {
      user = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (user && user.id !== id) {
        throw new BadRequestException('This email is already taken');
      }
    }

    if (updateUserDto.mobile) {
      user = await this.prisma.user.findUnique({
        where: { mobile: updateUserDto.mobile },
      });
      if (user && user.id !== id) {
        throw new BadRequestException('This mobile number is already taken');
      }
    }

    // Hash password here using bcrypt
    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
