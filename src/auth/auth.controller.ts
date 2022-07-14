import {
  BadRequestException,
  NotFoundException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as bcrypt from 'bcryptjs';
//
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
//
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // password
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
    const jwtToken = await this.jwtService.signAsync({
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

  @Get('admin/user')
  async user(@Req() request: Request) {
    const cookie = request.cookies['jwt'];
    // retrieve token
    const { id } = await this.jwtService.verifyAsync(cookie);
    // find user
    const user = await this.userService.findOne({
      id,
    });
    return user;
  }
}
