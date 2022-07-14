import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

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
  async login(
    @Body() body: LoginDto,
    @Res({
      passthrough: true, // save jwt into cookie
    })
    response: Response,
  ) {
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
    // jwt token
    const jwtToken = this.jwtService.signAsync({
      id: user.id,
    });
    // set cookie
    response.cookie('jwt', jwtToken, {
      httpOnly: true,
    });
    return {
      message: 'success',
    };
  }
}
