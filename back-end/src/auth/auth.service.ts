import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { compare } from 'bcrypt';
import { updateProfileDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaClient,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    const token = await this.jwtService.signAsync(user);

    return { token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: loginDto.username }, { mobile: loginDto.username }],
      },
    });

    if (!user) {
      throw new NotFoundException('Unable to find user');
    }

    const isPasswordValid = compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = await this.jwtService.signAsync(user);
    return { token };
  }

  async profile(user_id: number) {
    return this.usersService.findOne(user_id);
  }

  async updateProfile(user_id: number, updateProfileDto: updateProfileDto) {
    return this.usersService.update(user_id, updateProfileDto);
  }
}
