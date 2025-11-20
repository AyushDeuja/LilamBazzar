import { Body, Controller, Post, Req, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/helper/public';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Payload } from 'src/interfaces/payload';
import { updateProfileDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  profile(@Req() req: Payload) {
    return this.authService.profile(req.payload.id);
  }

  @Patch('profile')
  updateProfile(
    @Req() req: Payload,
    @Body() updateProfileDto: updateProfileDto,
  ) {
    return this.authService.updateProfile(req.payload.id, updateProfileDto);
  }
}
