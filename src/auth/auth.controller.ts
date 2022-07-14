import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';

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

  @Post('admin/login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    // find user by email
    const user = await this.userService.findOne({
      email,
    });
    // validate
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credential');
    }
    // return user
    return user;
  }
}
