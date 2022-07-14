import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';

@Controller()
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('admin/register')
  async register(@Body() body: RegisterDto) {
    const { password_confirm, ...data } = body;
    // valid check
    if (data.password !== password_confirm) {
      throw new BadRequestException('Password not match');
    }
    // save user
    const hashed = await bcrypt.hash(data.password, 12);
    return this.userService.save({
      ...data,
      password: hashed,
      is_ambassador: false,
    });
  }
}
