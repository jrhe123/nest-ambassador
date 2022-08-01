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
  UseGuards,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as bcrypt from 'bcryptjs';
//
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
//
import { InfoDto } from './dtos/info.dto';
import { PasswordDto } from './dtos/password.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthGuard } from './auth.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // password
export class AuthController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post(['admin/register', 'ambassador/register'])
  async register(@Body() body: RegisterDto, @Req() request: Request) {
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
      is_ambassador: request.path.includes('ambassador'),
    });
  }

  @Post(['admin/login', 'ambassador/login'])
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
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
    // scope
    const adminLogin = request.path.includes('admin');
    //
    if (user.is_ambassador && adminLogin) {
      throw new UnauthorizedException();
    }
    // jwt token
    const jwtToken = await this.jwtService.signAsync({
      id: user.id,
      scope: adminLogin ? 'admin' : 'ambassador',
    });
    // set cookie
    response.cookie('jwt', jwtToken, {
      httpOnly: true,
    });
    return {
      message: 'success',
    };
  }

  @UseGuards(AuthGuard)
  @Get(['admin/user', 'ambassador/user'])
  async user(@Req() request: Request) {
    const cookie = request.cookies['jwt'];
    // retrieve token
    const { id } = await this.jwtService.verifyAsync(cookie);
    // check scope
    if (request.path.includes('admin')) {
      // find admin user
      const adminUser = await this.userService.findOne({
        id,
      });
      return adminUser;
    }
    // find ambassador user & revenue
    const ambassadorUser = await this.userService.findOne(
      {
        id,
      },
      ['orders', 'orders.order_items'],
    );
    const { orders, password, ...others } = ambassadorUser;
    return {
      ...others,
      revenue: ambassadorUser.revenue,
    };
  }

  @UseGuards(AuthGuard)
  @Post(['admin/logout', 'ambassador/logout'])
  async logout(
    @Res({
      passthrough: true, // pass jwt into cookie
    })
    response: Response,
  ) {
    response.clearCookie('jwt');
    return {
      message: 'success',
    };
  }

  @UseGuards(AuthGuard)
  @Put(['admin/users/info', 'ambassador/users/info'])
  async updateInfo(@Req() request: Request, @Body() body: InfoDto) {
    const cookie = request.cookies['jwt'];
    // retrieve token
    const { id } = await this.jwtService.verifyAsync(cookie);
    // update user
    await this.userService.update(id, {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
    });
    // return
    return this.userService.findOne({ id });
  }

  @UseGuards(AuthGuard)
  @Put(['admin/users/password', 'ambassador/users/password'])
  async updatePassword(@Req() request: Request, @Body() body: PasswordDto) {
    // valid check
    const { password_confirm, ...data } = body;
    if (data.password !== password_confirm) {
      throw new BadRequestException('Password not match');
    }
    const cookie = request.cookies['jwt'];
    // retrieve token
    const { id } = await this.jwtService.verifyAsync(cookie);
    // update pasword
    await this.userService.update(id, {
      password: await bcrypt.hash(data.password, 12),
    });
    return this.userService.findOne({ id });
  }
}
